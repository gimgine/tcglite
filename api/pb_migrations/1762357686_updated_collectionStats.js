/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3540079781")

  // update collection data
  unmarshal({
    "viewQuery": "SELECT\n  c.`id`,\n  c.`purchaseCost`,\n  c.`purchased`,\n  c.`purchasedFrom`,\n  SUM(i.`qtyAcquired`) AS totalQtyAcquired,\n  SUM(i.`qtySold`) AS totalQtySold,\n  SUM(i.`qtyAcquired` * COALESCE(p.`marketPrice`, 0)) AS totalMarketValue,\n  SUM(i.`qtySold` * COALESCE(p.`marketPrice`, 0)) AS totalSoldValue\nFROM `collections` c\nJOIN `inventoryItems` i ON i.`collection` = c.`id`\nJOIN `products` p ON p.`id` = i.`product`\nGROUP BY c.`id`;"
  }, collection)

  // remove field
  collection.fields.removeById("_clone_PfDG")

  // remove field
  collection.fields.removeById("_clone_Y5WI")

  // remove field
  collection.fields.removeById("_clone_1OJj")

  // remove field
  collection.fields.removeById("json704823424")

  // remove field
  collection.fields.removeById("json2365108344")

  // remove field
  collection.fields.removeById("json3312473123")

  // remove field
  collection.fields.removeById("json1467399612")

  // add field
  collection.fields.addAt(1, new Field({
    "hidden": false,
    "id": "_clone_nVov",
    "max": null,
    "min": null,
    "name": "purchaseCost",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(2, new Field({
    "hidden": false,
    "id": "_clone_2PqH",
    "max": "",
    "min": "",
    "name": "purchased",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "date"
  }))

  // add field
  collection.fields.addAt(3, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "_clone_eHKG",
    "max": 0,
    "min": 0,
    "name": "purchasedFrom",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "json186476021",
    "maxSize": 1,
    "name": "totalQtyAcquired",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // add field
  collection.fields.addAt(5, new Field({
    "hidden": false,
    "id": "json1413257530",
    "maxSize": 1,
    "name": "totalQtySold",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // add field
  collection.fields.addAt(6, new Field({
    "hidden": false,
    "id": "json3743476761",
    "maxSize": 1,
    "name": "totalMarketValue",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // add field
  collection.fields.addAt(7, new Field({
    "hidden": false,
    "id": "json4056250667",
    "maxSize": 1,
    "name": "totalSoldValue",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3540079781")

  // update collection data
  unmarshal({
    "viewQuery": "SELECT\n  c.`id`,\n  c.`purchaseCost`,\n  c.`purchased`,\n  c.`purchasedFrom`,\n  SUM(i.`qtyAcquired`) AS total_qty_acquired,\n  SUM(i.`qtySold`) AS total_qty_sold,\n  SUM(i.`qtyAcquired` * COALESCE(p.`marketPrice`, 0)) AS total_market_value,\n  SUM(i.`qtySold` * COALESCE(p.`marketPrice`, 0)) AS total_sold_value\nFROM `collections` c\nJOIN `inventoryItems` i ON i.`collection` = c.`id`\nJOIN `products` p ON p.`id` = i.`product`\nGROUP BY c.`id`;"
  }, collection)

  // add field
  collection.fields.addAt(1, new Field({
    "hidden": false,
    "id": "_clone_PfDG",
    "max": null,
    "min": null,
    "name": "purchaseCost",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(2, new Field({
    "hidden": false,
    "id": "_clone_Y5WI",
    "max": "",
    "min": "",
    "name": "purchased",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "date"
  }))

  // add field
  collection.fields.addAt(3, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "_clone_1OJj",
    "max": 0,
    "min": 0,
    "name": "purchasedFrom",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "json704823424",
    "maxSize": 1,
    "name": "total_qty_acquired",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // add field
  collection.fields.addAt(5, new Field({
    "hidden": false,
    "id": "json2365108344",
    "maxSize": 1,
    "name": "total_qty_sold",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // add field
  collection.fields.addAt(6, new Field({
    "hidden": false,
    "id": "json3312473123",
    "maxSize": 1,
    "name": "total_market_value",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // add field
  collection.fields.addAt(7, new Field({
    "hidden": false,
    "id": "json1467399612",
    "maxSize": 1,
    "name": "total_sold_value",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // remove field
  collection.fields.removeById("_clone_nVov")

  // remove field
  collection.fields.removeById("_clone_2PqH")

  // remove field
  collection.fields.removeById("_clone_eHKG")

  // remove field
  collection.fields.removeById("json186476021")

  // remove field
  collection.fields.removeById("json1413257530")

  // remove field
  collection.fields.removeById("json3743476761")

  // remove field
  collection.fields.removeById("json4056250667")

  return app.save(collection)
})
