/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1212180286")

  // update collection data
  unmarshal({
    "viewQuery": "SELECT\n(ROW_NUMBER() OVER()) as id,\nSUM(o.profit) as profit,\nSUM(\n\tCASE\n\t\tWHEN DATE(o.created) = CURRENT_DATE\n\t\tTHEN o.profit\n\t\tELSE 0\n\tEND\n) as todayProfit,\n(SUM(o.`totalPrice`)- SUM(o.`vendorFee`) - SUM(o.`processingFee`)) as grossSales,\nSUM(\n\tCASE\n\t\tWHEN DATE(o.created) = CURRENT_DATE\n\t\tTHEN (\n\t\t\to.totalPrice\n\t\t\t- o.vendorFee\n\t\t\t- o.processingFee\n\t\t)\n\t\tELSE 0\n\tEND\n) as todayGrossSales,\nCOUNT(*) orderCount,\nCOUNT(\n\tCASE\n\t\tWHEN DATE(o.created) = CURRENT_DATE\n\t\tTHEN 1\n\tEND\n) as todayOrderCount,\nMAX(o.created) as lastUpdated,\n0 as quotaCompletion\nFROM orders o\n"
  }, collection)

  // remove field
  collection.fields.removeById("json2171810274")

  // add field
  collection.fields.addAt(6, new Field({
    "hidden": false,
    "id": "number2171810274",
    "max": null,
    "min": null,
    "name": "todayOrderCount",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1212180286")

  // update collection data
  unmarshal({
    "viewQuery": "SELECT\n(ROW_NUMBER() OVER()) as id,\nSUM(o.profit) as profit,\nSUM(\n\tCASE\n\t\tWHEN DATE(o.created) = CURRENT_DATE\n\t\tTHEN o.profit\n\t\tELSE 0\n\tEND\n) as todayProfit,\n(SUM(o.`totalPrice`)- SUM(o.`vendorFee`) - SUM(o.`processingFee`)) as grossSales,\n0 as todayGrossSales,\nCOUNT(*) orderCount,\n0 as todayOrderCount,\n0 as lastUpdated,\n0 as quotaCompletion\nFROM orders o\n"
  }, collection)

  // add field
  collection.fields.addAt(6, new Field({
    "hidden": false,
    "id": "json2171810274",
    "maxSize": 1,
    "name": "todayOrderCount",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // remove field
  collection.fields.removeById("number2171810274")

  return app.save(collection)
})
