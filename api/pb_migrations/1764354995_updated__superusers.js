/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3142635823")

  // remove field
  collection.fields.removeById("relation4283914359")

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3142635823")

  // add field
  collection.fields.addAt(7, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_3800236418",
    "hidden": false,
    "id": "relation4283914359",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "store",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
})
