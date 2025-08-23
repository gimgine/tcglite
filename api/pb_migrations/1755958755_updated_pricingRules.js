/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1956828121")

  // add field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "select2253611071",
    "maxSelect": 1,
    "name": "filterType",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "equals",
      "does not equal",
      "contains",
      "does not contain",
      "begins with",
      "ends with",
      "greater than",
      "greater than or equal",
      "less than",
      "less than or equal"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1956828121")

  // remove field
  collection.fields.removeById("select2253611071")

  return app.save(collection)
})
