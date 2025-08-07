/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1956828121")

  // remove field
  collection.fields.removeById("text2143575837")

  // add field
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
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1956828121")

  // add field
  collection.fields.addAt(1, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text2143575837",
    "max": 0,
    "min": 0,
    "name": "filter",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // remove field
  collection.fields.removeById("select2143575837")

  return app.save(collection)
})
