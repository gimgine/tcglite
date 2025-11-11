/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_280431851")

  // update field
  collection.fields.addAt(8, new Field({
    "hidden": false,
    "id": "date1904191227",
    "max": "",
    "min": "",
    "name": "listed",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "date"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_280431851")

  // update field
  collection.fields.addAt(8, new Field({
    "hidden": false,
    "id": "date1904191227",
    "max": "",
    "min": "",
    "name": "acquired",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "date"
  }))

  return app.save(collection)
})
