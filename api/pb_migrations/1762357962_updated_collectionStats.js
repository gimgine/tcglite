/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3540079781")

  // update collection data
  unmarshal({
    "viewQuery": "SELECT\n  c.`id`,\n  c.`store`,\n  c.`name`,\n  c.`purchaseCost`,\n  c.`purchased`,\n  c.`purchasedFrom`,\n  SUM(i.`qtyAcquired`) AS totalQtyAcquired,\n  SUM(i.`qtySold`) AS totalQtySold,\n  SUM(i.`qtyAcquired` * COALESCE(p.`marketPrice`, 0)) AS totalMarketValue,\n  SUM(i.`qtySold` * COALESCE(p.`marketPrice`, 0)) AS totalSoldValue\nFROM `collections` c\nJOIN `inventoryItems` i ON i.`collection` = c.`id`\nJOIN `products` p ON p.`id` = i.`product`\nGROUP BY c.`id`;"
  }, collection)

  // remove field
  collection.fields.removeById("_clone_fpTO")

  // remove field
  collection.fields.removeById("_clone_pbmt")

  // remove field
  collection.fields.removeById("_clone_TcaF")

  // remove field
  collection.fields.removeById("_clone_G5Tc")

  // add field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": true,
    "collectionId": "pbc_3800236418",
    "hidden": false,
    "id": "_clone_zwIA",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "store",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // add field
  collection.fields.addAt(2, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "_clone_2eGg",
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
  collection.fields.addAt(3, new Field({
    "hidden": false,
    "id": "_clone_PuSd",
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
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "_clone_MYMd",
    "max": "",
    "min": "",
    "name": "purchased",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "date"
  }))

  // add field
  collection.fields.addAt(5, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "_clone_ce7r",
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

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3540079781")

  // update collection data
  unmarshal({
    "viewQuery": "SELECT\n  c.`id`,\n  c.`name`,\n  c.`purchaseCost`,\n  c.`purchased`,\n  c.`purchasedFrom`,\n  SUM(i.`qtyAcquired`) AS totalQtyAcquired,\n  SUM(i.`qtySold`) AS totalQtySold,\n  SUM(i.`qtyAcquired` * COALESCE(p.`marketPrice`, 0)) AS totalMarketValue,\n  SUM(i.`qtySold` * COALESCE(p.`marketPrice`, 0)) AS totalSoldValue\nFROM `collections` c\nJOIN `inventoryItems` i ON i.`collection` = c.`id`\nJOIN `products` p ON p.`id` = i.`product`\nGROUP BY c.`id`;"
  }, collection)

  // add field
  collection.fields.addAt(1, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "_clone_fpTO",
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
    "id": "_clone_pbmt",
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
    "id": "_clone_TcaF",
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
    "id": "_clone_G5Tc",
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
  collection.fields.removeById("_clone_zwIA")

  // remove field
  collection.fields.removeById("_clone_2eGg")

  // remove field
  collection.fields.removeById("_clone_PuSd")

  // remove field
  collection.fields.removeById("_clone_MYMd")

  // remove field
  collection.fields.removeById("_clone_ce7r")

  return app.save(collection)
})
