/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3219110441")

  // update field
  collection.fields.addAt(6, new Field({
    "cascadeDelete": true,
    "collectionId": "pbc_3527180448",
    "hidden": false,
    "id": "relation4113142680",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "order",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // update field
  collection.fields.addAt(7, new Field({
    "cascadeDelete": true,
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
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3219110441")

  // update field
  collection.fields.addAt(6, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_3527180448",
    "hidden": false,
    "id": "relation4113142680",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "order",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // update field
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
