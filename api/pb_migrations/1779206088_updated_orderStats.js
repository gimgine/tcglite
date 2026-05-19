/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1212180286")

  // update collection data
  unmarshal({
    "viewQuery": "SELECT\n(ROW_NUMBER() OVER()) as id,\nSUM(o.profit) as profit,\nSUM(\n\tCASE\n\t\tWHEN DATE(o.created) = CURRENT_DATE\n\t\tTHEN o.profit\n\t\tELSE 0\n\tEND\n) as todayProfit,\n(SUM(o.`totalPrice`)- SUM(o.`vendorFee`) - SUM(o.`processingFee`)) as grossSales,\n0 as todayGrossSales,\nCOUNT(*) orderCount,\n0 as todayOrderCount,\n0 as lastUpdated,\n0 as quotaCompletion\nFROM orders o\n"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1212180286")

  // update collection data
  unmarshal({
    "viewQuery": "SELECT\n(ROW_NUMBER() OVER()) as id,\nSUM(o.profit) as profit,\n0 as todayProfit,\n(SUM(o.`totalPrice`)- SUM(o.`vendorFee`) - SUM(o.`processingFee`)) as grossSales,\n0 as todayGrossSales,\nCOUNT(*) orderCount,\n0 as todayOrderCount,\n0 as lastUpdated,\n0 as quotaCompletion\nFROM orders o\n"
  }, collection)

  return app.save(collection)
})
