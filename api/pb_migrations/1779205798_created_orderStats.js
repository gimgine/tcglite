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
        "id": "json4122618561",
        "maxSize": 1,
        "name": "profit",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      },
      {
        "hidden": false,
        "id": "json578462785",
        "maxSize": 1,
        "name": "todayProfit",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      },
      {
        "hidden": false,
        "id": "json997929919",
        "maxSize": 1,
        "name": "grossSales",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      },
      {
        "hidden": false,
        "id": "json4005831479",
        "maxSize": 1,
        "name": "todayGrossSales",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      },
      {
        "hidden": false,
        "id": "number1422664042",
        "max": null,
        "min": null,
        "name": "orderCount",
        "onlyInt": false,
        "presentable": false,
        "required": false,
        "system": false,
        "type": "number"
      },
      {
        "hidden": false,
        "id": "json2171810274",
        "maxSize": 1,
        "name": "todayOrderCount",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      },
      {
        "hidden": false,
        "id": "json2048051762",
        "maxSize": 1,
        "name": "lastUpdated",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      },
      {
        "hidden": false,
        "id": "json221019979",
        "maxSize": 1,
        "name": "quotaCompletion",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      }
    ],
    "id": "pbc_1212180286",
    "indexes": [],
    "listRule": null,
    "name": "orderStats",
    "system": false,
    "type": "view",
    "updateRule": null,
    "viewQuery": "SELECT\n(ROW_NUMBER() OVER()) as id,\nSUM(o.profit) profit,\n0 as todayProfit,\n(SUM(o.`totalPrice`) - SUM(o.`shippingFee`) - SUM(o.`processingFee`)) as grossSales,\n0 as todayGrossSales,\nCOUNT(*) orderCount,\n0 as todayOrderCount,\n0 as lastUpdated,\n0 as quotaCompletion\nFROM orders o\n",
    "viewRule": null
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1212180286");

  return app.delete(collection);
})
