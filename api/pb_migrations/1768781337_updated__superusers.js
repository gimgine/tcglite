/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3142635823")

  // add field
  collection.fields.addAt(7, new Field({
    "hidden": false,
    "id": "date270155397",
    "max": "",
    "min": "",
    "name": "possessionDate",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "date"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3142635823")

  // remove field
  collection.fields.removeById("date270155397")

  return app.save(collection)
})
