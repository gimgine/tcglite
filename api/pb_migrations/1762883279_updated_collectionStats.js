/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3540079781")

  // update collection data
  unmarshal({
    "viewQuery": "SELECT \n  c.id, \n  c.store, \n  c.name, \n  c.purchaseCost, \n  c.purchased, \n  c.purchasedFrom, \n  SUM(i.qtyAcquired) AS totalQtyAcquired, \n  SUM(i.qtySold) AS totalQtySold, \n  SUM(i.qtyAcquired * COALESCE(p.marketPrice, 0)) AS totalMarketValue,\n  SUM(i.qtyAcquired * COALESCE(i.`marketPriceAtImport`, 0)) AS totalMarketValueAtImport,\n  SUM(i.qtySold * COALESCE(p.ourPrice, 0)) AS totalSoldValue \nFROM collections c \nJOIN collectionItems i ON i.collection = c.id \nJOIN products p ON p.id = i.product \nGROUP BY c.id;"
  }, collection)

  // remove field
  collection.fields.removeById("_clone_RBQM")

  // remove field
  collection.fields.removeById("_clone_MLeh")

  // remove field
  collection.fields.removeById("_clone_XrdK")

  // remove field
  collection.fields.removeById("_clone_VCs0")

  // remove field
  collection.fields.removeById("_clone_1dL4")

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

  // add field
  collection.fields.addAt(9, new Field({
    "hidden": false,
    "id": "json418351223",
    "maxSize": 1,
    "name": "totalMarketValueAtImport",
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
    "viewQuery": "SELECT \n  c.id, \n  c.store, \n  c.name, \n  c.purchaseCost, \n  c.purchased, \n  c.purchasedFrom, \n  SUM(i.qtyAcquired) AS totalQtyAcquired, \n  SUM(i.qtySold) AS totalQtySold, \n  SUM(i.qtyAcquired * COALESCE(p.marketPrice, 0)) AS totalMarketValue, \n  SUM(i.qtySold * COALESCE(p.ourPrice, 0)) AS totalSoldValue \nFROM collections c \nJOIN collectionItems i ON i.collection = c.id \nJOIN products p ON p.id = i.product \nGROUP BY c.id;"
  }, collection)

  // add field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": true,
    "collectionId": "pbc_3800236418",
    "hidden": false,
    "id": "_clone_RBQM",
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
    "id": "_clone_MLeh",
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
    "id": "_clone_XrdK",
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
    "id": "_clone_VCs0",
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
    "id": "_clone_1dL4",
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
  collection.fields.removeById("_clone_Jfvg")

  // remove field
  collection.fields.removeById("_clone_1W7y")

  // remove field
  collection.fields.removeById("_clone_cOjQ")

  // remove field
  collection.fields.removeById("_clone_ZyFU")

  // remove field
  collection.fields.removeById("_clone_1R5S")

  // remove field
  collection.fields.removeById("json418351223")

  return app.save(collection)
})
