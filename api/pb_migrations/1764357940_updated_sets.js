/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3011519073")

  // add field
  collection.fields.addAt(3, new Field({
    "hidden": false,
    "id": "bool652584626",
    "name": "isSorted",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3011519073")

  // remove field
  collection.fields.removeById("bool652584626")

  return app.save(collection)
})
