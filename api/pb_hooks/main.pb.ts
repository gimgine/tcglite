/// <reference path="../pb_data/types.d.ts" />
/// <reference lib="es2015" />

routerAdd(
  "POST",
  "/products/sync",
  (e) => {
    console.log("[/products-sync] START");

    const body = e.requestInfo().body; // <-- unchanged
    const pricingCsv = body?.pricingCsv || [];
    console.log("[/products-sync] pricingCsv length:", pricingCsv.length);

    const products = $app.findAllRecords("products");
    console.log("[/products-sync] Loaded", products.length, "products");

    // --- Build index by tcgPlayerId to speed up diffing ---
    const productsByTcgId = {};
    for (const p of products) {
      const id = p.get("tcgPlayerId");
      if (id !== null && id !== undefined) {
        productsByTcgId[id] = p;
      }
    }
    console.log("[/products-sync] Built tcgPlayerId index | indexed:", Object.keys(productsByTcgId).length);

    const productsToCreate = [];
    const productsToUpdate = [];
    const date = new Date().toUTCString();

    // --- Diffing (hot path) ---
    let processed = 0;

    for (const pricing of pricingCsv) {
      const tcgId = pricing["TCGplayer Id"];
      const possibleProductForPricing = productsByTcgId[tcgId];

      if (possibleProductForPricing) {
        let shouldUpdate = false;

        const currentMarketPrice = possibleProductForPricing.get("marketPrice");
        const newMarketPrice = pricing["TCG Market Price"] ?? 0;

        if (currentMarketPrice !== newMarketPrice) {
          possibleProductForPricing.set("marketPrice", newMarketPrice);
          possibleProductForPricing.set("marketPriceUpdated", date);
          shouldUpdate = true;
        }

        const currentOurPrice = possibleProductForPricing.get("ourPrice");
        const newOurPrice = pricing["TCG Marketplace Price"] ?? 0;

        if (currentOurPrice !== newOurPrice) {
          possibleProductForPricing.set("ourPrice", newOurPrice);
          shouldUpdate = true;
        }

        if (shouldUpdate) {
          productsToUpdate.push(possibleProductForPricing);
        }
      } else {
        productsToCreate.push(pricing);
      }

      processed++;
      if (processed % 500 === 0) {
        console.log("[/products-sync] Diff progress:", processed, "/", pricingCsv.length);
      }
    }

    console.log("[/products-sync] Diffing complete | toCreate:", productsToCreate.length, "| toUpdate:", productsToUpdate.length);

    if (!productsToCreate.length && !productsToUpdate.length) {
      console.log("[/products-sync] No changes needed.");
      return e.json(200, { message: "No updates were needed." });
    }

    // --- Transactional create/update ---
    $app.runInTransaction((txApp) => {
      const collection = txApp.findCollectionByNameOrId("products");
      console.log("[/products-sync] Transaction started | collection id:", collection?.id);

      let createdCount = 0;

      for (const product of productsToCreate) {
        const record = new Record(collection);
        record.set("productLine", product["Product Line"]);
        record.set("name", product["Product Name"]);
        record.set("condition", product["Condition"]);
        record.set("set", product["Set Name"]);
        record.set("number", product["Number"]);
        record.set("rarity", product["Rarity"]);

        const conditionStr = product["Condition"] ?? "";
        const language = conditionStr.split(" - ")[1] ?? "English"; // ex. 'Near Mint - Japanese'
        record.set("language", language);

        record.set("tcgPlayerId", product["TCGplayer Id"]);
        record.set("marketPrice", product["TCG Market Price"]);
        record.set("marketPriceUpdated", date);
        record.set("ourPrice", product["TCG Marketplace Price"]);

        txApp.save(record);
        createdCount++;
      }

      console.log("[/products-sync] Created", createdCount, "records");

      let updatedCount = 0;

      for (const product of productsToUpdate) {
        txApp.save(product);
        updatedCount++;
      }

      console.log("[/products-sync] Updated", updatedCount, "records");
    });

    console.log("[/products-sync] DONE");

    return e.json(200, {
      message: "Product list successfully synchronized.",
    });
  },
  $apis.requireAuth()
);

routerAdd(
  "PATCH",
  "/collections/{collectionId}/scan",
  (e) => {
    const collectionId = e.request?.pathValue("collectionId");

    // 1) Load the collection & its items
    const collection = $app.findRecordById("collections", collectionId);
    const collectionPurchasedISO = collection.get("purchased");

    const collectionItems = $app.findRecordsByFilter("collectionItems", `collection = "${collectionId}"`, "listed", 0, 0);

    // 2) Load UNASSIGNED orderItems on/after the collection's purchase date
    const orderItems = $app.findRecordsByFilter(
      "orderItems",
      `order.orderDate >= "${collectionPurchasedISO}" && (collectionItem = null || collectionItem = "")`,
      "order.orderDate", // same as client
      0,
      0
    );
    $app.expandRecords(orderItems, ["order"], null);

    // 3) Build per-product FIFO queues of unassigned orderItems
    const queueByProduct = new Map();
    for (const oi of orderItems) {
      const productId = oi.get("product");
      const orderDate = oi.expandedOne("order").get("orderDate");
      if (!productId || !orderDate) continue; // must have product & order.date
      const arr = queueByProduct.get(productId) ?? [];
      arr.push(oi);
      queueByProduct.set(productId, arr);
    }

    // 4) Allocate: walk each collection item, fill up to (qtyAcquired - qtySold)
    $app.runInTransaction((txApp) => {
      let itemsUpdated = 0;
      let ordersUpdated = 0;
      let totalAssigned = 0;

      for (const ci of collectionItems) {
        const cap = ci.get("qtyAcquired") ?? 0;
        const currentSold = ci.get("qtySold") ?? 0;
        if (!ci.get("product") || cap <= 0 || currentSold >= cap) continue;

        const queue = queueByProduct.get(ci.get("product"));
        if (!queue || queue.length === 0) continue;

        // Determine the earliest allowable order date for this item
        // Orders must be on/after the collection purchased date (already filtered)
        // If we also respect listed date, ensure orderDate >= ci.listed
        const listedCutoff = new Date(ci.get("listed"));

        let remaining = cap - currentSold;
        let added = 0;

        // Consume oldest orders that satisfy the listed cutoff
        // (Since queue is sorted by order.orderDate, we can skip until cutoff)
        let i = 0;
        while (remaining > 0 && i < queue.length) {
          const oi = queue[i];
          const orderDateISO = oi.expandedOne("order").get("orderDate");
          if (!orderDateISO) {
            i++;
            continue;
          }

          const orderDate = new Date(orderDateISO);
          if (orderDate < listedCutoff) {
            // This order is too early for this item—skip it for this item,
            // but don't remove from the global queue; it might fit a different item with an earlier listed date.
            i++;
            continue;
          }

          oi.set("collectionItem", ci.id);
          txApp.save(oi);

          ordersUpdated++;
          totalAssigned++;

          // Remove it from the queue so it can't be reused
          queue.splice(i, 1);

          // Increment the item's sold count locally
          remaining -= 1;
          added += 1;
        }

        if (added > 0) {
          ci.set("qtySold", currentSold + added);
          txApp.save(ci);
          itemsUpdated++;
        }
      }

      return e.json(200, {
        itemsUpdated,
        ordersUpdated,
        unitsAssigned: totalAssigned,
      });
    });
  },
  $apis.requireAuth()
);
