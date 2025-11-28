/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3540079781")

  // update collection data
  unmarshal({
    "listRule": null,
    "viewRule": null
  }, collection)

  // remove field
  collection.fields.removeById("_clone_yFWs")

  // remove field
  collection.fields.removeById("_clone_DSVf")

  // remove field
  collection.fields.removeById("_clone_A46x")

  // remove field
  collection.fields.removeById("_clone_q9sy")

  // add field
  collection.fields.addAt(1, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "_clone_ML29",
    "max": 0,
    "min": 0,
    "name": "name",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(2, new Field({
    "hidden": false,
    "id": "_clone_LeTv",
    "max": null,
    "min": null,
    "name": "purchaseCost",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(3, new Field({
    "hidden": false,
    "id": "_clone_Eb2S",
    "max": "",
    "min": "",
    "name": "purchased",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "date"
  }))

  // add field
  collection.fields.addAt(4, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "_clone_Fmxm",
    "max": 0,
    "min": 0,
    "name": "purchasedFrom",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3540079781")

  // update collection data
  unmarshal({
    "listRule": "",
    "viewRule": ""
  }, collection)

  // add field
  collection.fields.addAt(1, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "_clone_yFWs",
    "max": 0,
    "min": 0,
    "name": "name",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(2, new Field({
    "hidden": false,
    "id": "_clone_DSVf",
    "max": null,
    "min": null,
    "name": "purchaseCost",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(3, new Field({
    "hidden": false,
    "id": "_clone_A46x",
    "max": "",
    "min": "",
    "name": "purchased",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "date"
  }))

  // add field
  collection.fields.addAt(4, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "_clone_q9sy",
    "max": 0,
    "min": 0,
    "name": "purchasedFrom",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // remove field
  collection.fields.removeById("_clone_ML29")

  // remove field
  collection.fields.removeById("_clone_LeTv")

  // remove field
  collection.fields.removeById("_clone_Eb2S")

  // remove field
  collection.fields.removeById("_clone_Fmxm")

  return app.save(collection)
})
