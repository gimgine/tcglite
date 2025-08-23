/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1956828121")

  // update field
  collection.fields.addAt(1, new Field({
    "hidden": false,
    "id": "select2143575837",
    "maxSelect": 1,
    "name": "filter",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "all",
      "set",
      "quantity",
      "market",
      "low",
      "our"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1956828121")

  // update field
  collection.fields.addAt(1, new Field({
    "hidden": false,
    "id": "select2143575837",
    "maxSelect": 1,
    "name": "filter",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "all",
      "set",
      "quantity",
      "market",
      "low"
    ]
  }))

  return app.save(collection)
})
