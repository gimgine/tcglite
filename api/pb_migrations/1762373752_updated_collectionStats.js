/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3540079781")

  // update collection data
  unmarshal({
    "viewQuery": "SELECT c.id, c.store, c.name, c.purchaseCost, c.purchased, c.purchasedFrom, SUM(i.qtyAcquired) AS totalQtyAcquired, SUM(i.qtySold) AS totalQtySold, SUM(i.qtyAcquired * COALESCE(p.marketPrice, 0)) AS totalMarketValue, SUM(i.qtySold * COALESCE(p.ourPrice, 0)) AS totalSoldValue FROM collections c JOIN inventoryItems i ON i.collection = c.id JOIN products p ON p.id = i.product GROUP BY c.id;"
  }, collection)

  // remove field
  collection.fields.removeById("_clone_CXEg")

  // remove field
  collection.fields.removeById("_clone_yH7O")

  // remove field
  collection.fields.removeById("_clone_ab3A")

  // remove field
  collection.fields.removeById("_clone_xecJ")

  // remove field
  collection.fields.removeById("_clone_h412")

  // add field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": true,
    "collectionId": "pbc_3800236418",
    "hidden": false,
    "id": "_clone_WzVF",
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
    "id": "_clone_1Yuy",
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
    "id": "_clone_YGDG",
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
    "id": "_clone_G9sB",
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
    "id": "_clone_Ghii",
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
    "viewQuery": "SELECT\n  c.`id`,\n  c.`store`,\n  c.`name`,\n  c.`purchaseCost`,\n  c.`purchased`,\n  c.`purchasedFrom`,\n  SUM(i.`qtyAcquired`) AS totalQtyAcquired,\n  SUM(i.`qtySold`) AS totalQtySold,\n  SUM(i.`qtyAcquired` * COALESCE(p.`marketPrice`, 0)) AS totalMarketValue,\n  SUM(i.`qtySold` * COALESCE(p.`ourPrice`, 0)) AS totalSoldValue\nFROM `collections` c\nJOIN `inventoryItems` i ON i.`collection` = c.`id`\nJOIN `products` p ON p.`id` = i.`product`\nGROUP BY c.`id`;"
  }, collection)

  // add field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": true,
    "collectionId": "pbc_3800236418",
    "hidden": false,
    "id": "_clone_CXEg",
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
    "id": "_clone_yH7O",
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
    "id": "_clone_ab3A",
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
    "id": "_clone_xecJ",
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
    "id": "_clone_h412",
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
  collection.fields.removeById("_clone_WzVF")

  // remove field
  collection.fields.removeById("_clone_1Yuy")

  // remove field
  collection.fields.removeById("_clone_YGDG")

  // remove field
  collection.fields.removeById("_clone_G9sB")

  // remove field
  collection.fields.removeById("_clone_Ghii")

  return app.save(collection)
})
