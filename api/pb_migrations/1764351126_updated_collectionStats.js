/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3540079781")

  // update collection data
  unmarshal({
    "listRule": "",
    "viewQuery": "SELECT \n  c.id, \n  c.name, \n  c.purchaseCost, \n  c.purchased, \n  c.purchasedFrom, \n  SUM(i.qtyAcquired) AS totalQtyAcquired, \n  SUM(i.qtySold) AS totalQtySold, \n  SUM(i.qtyAcquired * COALESCE(p.marketPrice, 0)) AS totalMarketValue,\n  SUM(i.qtyAcquired * COALESCE(i.`marketPriceAtImport`, 0)) AS totalMarketValueAtImport,\n  SUM(i.qtySold * COALESCE(p.ourPrice, 0)) AS totalSoldValue \nFROM collections c \nJOIN collectionItems i ON i.collection = c.id \nJOIN products p ON p.id = i.product \nGROUP BY c.id;",
    "viewRule": ""
  }, collection)

  // remove field
  collection.fields.removeById("_clone_Jfvg")

  // remove field
  collection.fields.removeById("_clone_1W7y")

  // remove field
  collection.fields.removeById("_clone_cOjQ")

  // remove field
  collection.fields.removeById("_clone_ZyFU")

  // remove field
  collection.fields.removeById("_clone_1R5S")

  // add field
  collection.fields.addAt(1, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "_clone_yFWs",
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
    "id": "_clone_DSVf",
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
    "id": "_clone_A46x",
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
    "id": "_clone_q9sy",
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
    "listRule": "@request.auth.store.id = store",
    "viewQuery": "SELECT \n  c.id, \n  c.store, \n  c.name, \n  c.purchaseCost, \n  c.purchased, \n  c.purchasedFrom, \n  SUM(i.qtyAcquired) AS totalQtyAcquired, \n  SUM(i.qtySold) AS totalQtySold, \n  SUM(i.qtyAcquired * COALESCE(p.marketPrice, 0)) AS totalMarketValue,\n  SUM(i.qtyAcquired * COALESCE(i.`marketPriceAtImport`, 0)) AS totalMarketValueAtImport,\n  SUM(i.qtySold * COALESCE(p.ourPrice, 0)) AS totalSoldValue \nFROM collections c \nJOIN collectionItems i ON i.collection = c.id \nJOIN products p ON p.id = i.product \nGROUP BY c.id;",
    "viewRule": "@request.auth.store.id = store"
  }, collection)

  // add field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": true,
    "collectionId": "pbc_3800236418",
    "hidden": false,
    "id": "_clone_Jfvg",
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
    "id": "_clone_1W7y",
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
    "id": "_clone_cOjQ",
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
    "id": "_clone_ZyFU",
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
    "id": "_clone_1R5S",
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
  collection.fields.removeById("_clone_yFWs")

  // remove field
  collection.fields.removeById("_clone_DSVf")

  // remove field
  collection.fields.removeById("_clone_A46x")

  // remove field
  collection.fields.removeById("_clone_q9sy")

  return app.save(collection)
})
