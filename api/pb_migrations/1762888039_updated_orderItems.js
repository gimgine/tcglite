/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3468410069")

  // remove field
  collection.fields.removeById("relation1523268798")

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3468410069")

  // add field
  collection.fields.addAt(5, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_280431851",
    "hidden": false,
    "id": "relation1523268798",
    "maxSelect": 999,
    "minSelect": 0,
    "name": "collectionItem",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
})
