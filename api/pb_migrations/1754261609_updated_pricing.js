/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1956828121")

  // add field
  collection.fields.addAt(6, new Field({
    "hidden": false,
    "id": "date3060926358",
    "max": "",
    "min": "",
    "name": "lastUsed",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "date"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1956828121")

  // remove field
  collection.fields.removeById("date3060926358")

  return app.save(collection)
})
