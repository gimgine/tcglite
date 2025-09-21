/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2270692879")

  // update field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": true,
    "collectionId": "pbc_1350823029",
    "hidden": false,
    "id": "relation340149741",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "strategy",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // update field
  collection.fields.addAt(2, new Field({
    "cascadeDelete": true,
    "collectionId": "pbc_1956828121",
    "hidden": false,
    "id": "relation1188605132",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "rule",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // update field
  collection.fields.addAt(4, new Field({
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
  const collection = app.findCollectionByNameOrId("pbc_2270692879")

  // update field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_1350823029",
    "hidden": false,
    "id": "relation340149741",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "strategy",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // update field
  collection.fields.addAt(2, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_1956828121",
    "hidden": false,
    "id": "relation1188605132",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "rule",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // update field
  collection.fields.addAt(4, new Field({
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
