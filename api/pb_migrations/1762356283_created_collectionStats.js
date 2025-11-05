/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    "createRule": null,
    "deleteRule": null,
    "fields": [
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text3208210256",
        "max": 0,
        "min": 0,
        "name": "id",
        "pattern": "^[a-z0-9]+$",
        "presentable": false,
        "primaryKey": true,
        "required": true,
        "system": true,
        "type": "text"
      },
      {
        "hidden": false,
        "id": "_clone_eC4w",
        "max": null,
        "min": null,
        "name": "purchaseCost",
        "onlyInt": false,
        "presentable": false,
        "required": false,
        "system": false,
        "type": "number"
      },
      {
        "hidden": false,
        "id": "_clone_sIGq",
        "max": "",
        "min": "",
        "name": "purchased",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "date"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "_clone_H6Jo",
        "max": 0,
        "min": 0,
        "name": "purchasedFrom",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "hidden": false,
        "id": "json704823424",
        "maxSize": 1,
        "name": "total_qty_acquired",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      },
      {
        "hidden": false,
        "id": "json3312473123",
        "maxSize": 1,
        "name": "total_market_value",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      },
      {
        "hidden": false,
        "id": "json1467399612",
        "maxSize": 1,
        "name": "total_sold_value",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      }
    ],
    "id": "pbc_3540079781",
    "indexes": [],
    "listRule": null,
    "name": "collectionStats",
    "system": false,
    "type": "view",
    "updateRule": null,
    "viewQuery": "SELECT\n  c.`id`,\n  c.`purchaseCost`,\n  c.`purchased`,\n  c.`purchasedFrom`,\n  SUM(i.`qtyAcquired`) AS total_qty_acquired,\n  SUM(i.`qtyAcquired` * COALESCE(p.`marketPrice`, 0)) AS total_market_value,\n  SUM(i.`qtySold` * COALESCE(p.`marketPrice`, 0)) AS total_sold_value\nFROM `collections` c\nJOIN `inventoryItems` i ON i.`collection` = c.`id`\nJOIN `products` p ON p.`id` = i.`product`\nGROUP BY c.`id`;",
    "viewRule": null
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3540079781");

  return app.delete(collection);
})
