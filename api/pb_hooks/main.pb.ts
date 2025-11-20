/// <reference path="../pb_data/types.d.ts" />
// @ts-nocheck

routerAdd(
  "POST",
  "/products/sync",
  (e) => {
    console.log("[/products-sync] START");

    const storeId = e.auth?.get("store");
    console.log("[/products-sync] storeId:", storeId);

    const body = e.requestInfo().body; // <-- unchanged
    const pricingCsv = body?.pricingCsv || [];
    console.log("[/products-sync] pricingCsv length:", pricingCsv.length);

    if (!storeId) {
      console.log("[/products-sync] Missing storeId on auth record");
      return e.json(400, { message: "Missing store on auth record" });
    }

    const products = $app.findRecordsByFilter("products", `store = '${storeId}'`, "", 0, 0);
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
        record.set("store", storeId);
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
      message: "Store product list successfully synchronized.",
    });
  },
  $apis.requireAuth()
);
