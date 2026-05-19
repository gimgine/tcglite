/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1212180286")

  // update collection data
  unmarshal({
    "viewQuery": "SELECT\n\t(ROW_NUMBER() OVER ()) as id,\n\n\tCAST(COALESCE(SUM(o.profit), 0) AS REAL) as profit,\n\n\tCAST(COALESCE(SUM(\n\t\tCASE\n\t\t\tWHEN DATE(o.created) = CURRENT_DATE\n\t\t\tTHEN o.profit\n\t\t\tELSE 0\n\t\tEND\n\t), 0) AS REAL) as todayProfit,\n\n\tCAST((\n\t\tCOALESCE(SUM(o.`totalPrice`), 0)\n\t\t- COALESCE(SUM(o.`vendorFee`), 0)\n\t\t- COALESCE(SUM(o.`processingFee`), 0)\n\t) AS REAL) as grossSales,\n\n\tCAST(COALESCE(SUM(\n\t\tCASE\n\t\t\tWHEN DATE(o.created) = CURRENT_DATE\n\t\t\tTHEN (\n\t\t\t\to.`totalPrice`\n\t\t\t\t- o.`vendorFee`\n\t\t\t\t- o.`processingFee`\n\t\t\t)\n\t\t\tELSE 0\n\t\tEND\n\t), 0) AS REAL) as todayGrossSales,\n\n\tCAST(COUNT(*) AS INTEGER) as orderCount,\n\n\tCAST(COUNT(\n\t\tCASE\n\t\t\tWHEN DATE(o.created) = CURRENT_DATE\n\t\t\tTHEN 1\n\t\tEND\n\t) AS INTEGER) as todayOrderCount,\n\n\tCAST(MAX(o.created) AS TEXT) as lastUpdated,\n\n\tCAST(COUNT(\n\t\tCASE\n\t\t\tWHEN o.created >= sp.possessionDate\n\t\t\tTHEN 1\n\t\tEND\n\t) AS INTEGER) as quotaCompletion\n\nFROM orders o\nCROSS JOIN storePreferences sp;"
  }, collection)

  // remove field
  collection.fields.removeById("json4122618561")

  // remove field
  collection.fields.removeById("json578462785")

  // remove field
  collection.fields.removeById("json997929919")

  // remove field
  collection.fields.removeById("json4005831479")

  // remove field
  collection.fields.removeById("json2048051762")

  // add field
  collection.fields.addAt(1, new Field({
    "hidden": false,
    "id": "number4122618561",
    "max": null,
    "min": null,
    "name": "profit",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(2, new Field({
    "hidden": false,
    "id": "number578462785",
    "max": null,
    "min": null,
    "name": "todayProfit",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(3, new Field({
    "hidden": false,
    "id": "number997929919",
    "max": null,
    "min": null,
    "name": "grossSales",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "number4005831479",
    "max": null,
    "min": null,
    "name": "todayGrossSales",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(7, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text2048051762",
    "max": 0,
    "min": 0,
    "name": "lastUpdated",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1212180286")

  // update collection data
  unmarshal({
    "viewQuery": "SELECT\n(ROW_NUMBER() OVER()) as id,\nSUM(o.profit) as profit,\nSUM(\n\tCASE\n\t\tWHEN DATE(o.created) = CURRENT_DATE\n\t\tTHEN o.profit\n\t\tELSE 0\n\tEND\n) as todayProfit,\n(SUM(o.`totalPrice`)- SUM(o.`vendorFee`) - SUM(o.`processingFee`)) as grossSales,\nSUM(\n\tCASE\n\t\tWHEN DATE(o.created) = CURRENT_DATE\n\t\tTHEN (\n\t\t\to.totalPrice\n\t\t\t- o.vendorFee\n\t\t\t- o.processingFee\n\t\t)\n\t\tELSE 0\n\tEND\n) as todayGrossSales,\nCOUNT(*) orderCount,\nCOUNT(\n\tCASE\n\t\tWHEN DATE(o.created) = CURRENT_DATE\n\t\tTHEN 1\n\tEND\n) as todayOrderCount,\nMAX(o.created) as lastUpdated,\nCOUNT(\n\tCASE\n\t\tWHEN o.created >= sp.possessionDate\n\t\tTHEN 1\n\tEND\n) as quotaCompletion\nFROM orders o\nCROSS JOIN storePreferences sp\n"
  }, collection)

  // add field
  collection.fields.addAt(1, new Field({
    "hidden": false,
    "id": "json4122618561",
    "maxSize": 1,
    "name": "profit",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // add field
  collection.fields.addAt(2, new Field({
    "hidden": false,
    "id": "json578462785",
    "maxSize": 1,
    "name": "todayProfit",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // add field
  collection.fields.addAt(3, new Field({
    "hidden": false,
    "id": "json997929919",
    "maxSize": 1,
    "name": "grossSales",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // add field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "json4005831479",
    "maxSize": 1,
    "name": "todayGrossSales",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // add field
  collection.fields.addAt(7, new Field({
    "hidden": false,
    "id": "json2048051762",
    "maxSize": 1,
    "name": "lastUpdated",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // remove field
  collection.fields.removeById("number4122618561")

  // remove field
  collection.fields.removeById("number578462785")

  // remove field
  collection.fields.removeById("number997929919")

  // remove field
  collection.fields.removeById("number4005831479")

  // remove field
  collection.fields.removeById("text2048051762")

  return app.save(collection)
})
