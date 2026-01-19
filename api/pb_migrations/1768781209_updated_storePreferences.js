/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1012939826")

  // add field
  collection.fields.addAt(10, new Field({
    "hidden": false,
    "id": "number3879562541",
    "max": null,
    "min": null,
    "name": "switchGoal",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1012939826")

  // remove field
  collection.fields.removeById("number3879562541")

  return app.save(collection)
})
