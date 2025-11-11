/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_280431851")

  // update collection data
  unmarshal({
    "name": "collectionItems"
  }, collection)

  // remove field
  collection.fields.removeById("select1602912115")

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_280431851")

  // update collection data
  unmarshal({
    "name": "inventoryItems"
  }, collection)

  // add field
  collection.fields.addAt(9, new Field({
    "hidden": false,
    "id": "select1602912115",
    "maxSelect": 1,
    "name": "source",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "select",
    "values": [
      "auto",
      "manual"
    ]
  }))

  return app.save(collection)
})
