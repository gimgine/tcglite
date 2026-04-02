/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3540079781")

  // update collection data
  unmarshal({
    "viewQuery": "SELECT \n  c.id, \n  c.name, \n  c.purchaseCost, \n  c.purchased, \n  c.purchasedFrom, \n  SUM(i.qtyAcquired) AS totalQtyAcquired, \n  SUM(i.qtySold) AS totalQtySold, \n  SUM(i.qtyAcquired * COALESCE(p.marketPrice, 0)) AS totalMarketValue,\n  SUM(i.qtyAcquired * COALESCE(i.`marketPriceAtImport`, 0)) AS totalMarketValueAtImport,\n  SUM(i.qtySold * COALESCE(p.ourPrice, 0)) AS totalSoldValue,\n  SUM(\n    CASE \n      WHEN (i.qtyAcquired - i.qtySold) > 0 \n      THEN (i.qtyAcquired - i.qtySold) * COALESCE(p.ourPrice, 0)\n      ELSE 0\n    END\n  ) AS totalRemainingValue\nFROM collections c \nJOIN collectionItems i ON i.collection = c.id \nJOIN products p ON p.id = i.product \nGROUP BY c.id;"
  }, collection)

  // remove field
  collection.fields.removeById("_clone_ML29")

  // remove field
  collection.fields.removeById("_clone_LeTv")

  // remove field
  collection.fields.removeById("_clone_Eb2S")

  // remove field
  collection.fields.removeById("_clone_Fmxm")

  // add field
  collection.fields.addAt(1, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "_clone_tW9K",
    "max": 0,
    "min": 0,
    "name": "name",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(2, new Field({
    "hidden": false,
    "id": "_clone_mk7D",
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
  collection.fields.addAt(3, new Field({
    "hidden": false,
    "id": "_clone_lyrY",
    "max": "",
    "min": "",
    "name": "purchased",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "date"
  }))

  // add field
  collection.fields.addAt(4, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "_clone_qBA3",
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
  collection.fields.addAt(10, new Field({
    "hidden": false,
    "id": "json2369852454",
    "maxSize": 1,
    "name": "totalRemainingValue",
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
    "viewQuery": "SELECT \n  c.id, \n  c.name, \n  c.purchaseCost, \n  c.purchased, \n  c.purchasedFrom, \n  SUM(i.qtyAcquired) AS totalQtyAcquired, \n  SUM(i.qtySold) AS totalQtySold, \n  SUM(i.qtyAcquired * COALESCE(p.marketPrice, 0)) AS totalMarketValue,\n  SUM(i.qtyAcquired * COALESCE(i.`marketPriceAtImport`, 0)) AS totalMarketValueAtImport,\n  SUM(i.qtySold * COALESCE(p.ourPrice, 0)) AS totalSoldValue \nFROM collections c \nJOIN collectionItems i ON i.collection = c.id \nJOIN products p ON p.id = i.product \nGROUP BY c.id;"
  }, collection)

  // add field
  collection.fields.addAt(1, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "_clone_ML29",
    "max": 0,
    "min": 0,
    "name": "name",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(2, new Field({
    "hidden": false,
    "id": "_clone_LeTv",
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
  collection.fields.addAt(3, new Field({
    "hidden": false,
    "id": "_clone_Eb2S",
    "max": "",
    "min": "",
    "name": "purchased",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "date"
  }))

  // add field
  collection.fields.addAt(4, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "_clone_Fmxm",
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

  // remove field
  collection.fields.removeById("_clone_tW9K")

  // remove field
  collection.fields.removeById("_clone_mk7D")

  // remove field
  collection.fields.removeById("_clone_lyrY")

  // remove field
  collection.fields.removeById("_clone_qBA3")

  // remove field
  collection.fields.removeById("json2369852454")

  return app.save(collection)
})
