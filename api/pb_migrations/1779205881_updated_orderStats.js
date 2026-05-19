/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1212180286")

  // update collection data
  unmarshal({
    "viewQuery": "SELECT\n(ROW_NUMBER() OVER()) as id,\nSUM(o.profit) as profit,\n0 as todayProfit,\n(SUM(o.`totalPrice`)- SUM(o.`shippingFee`) - SUM(o.`processingFee`)) as grossSales,\n0 as todayGrossSales,\nCOUNT(*) orderCount,\n0 as todayOrderCount,\n0 as lastUpdated,\n0 as quotaCompletion\nFROM orders o\n"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1212180286")

  // update collection data
  unmarshal({
    "viewQuery": "SELECT\n(ROW_NUMBER() OVER()) as id,\nSUM(o.profit) as profit,\n0 as todayProfit,\n(SUM(o.`totalPrice`)) as grossSales,\n0 as todayGrossSales,\nCOUNT(*) orderCount,\n0 as todayOrderCount,\n0 as lastUpdated,\n0 as quotaCompletion\nFROM orders o\n"
  }, collection)

  return app.save(collection)
})
