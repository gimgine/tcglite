/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1956828121")

  // update collection data
  unmarshal({
    "name": "pricingRules"
  }, collection)

  // remove field
  collection.fields.removeById("text1841317061")

  // remove field
  collection.fields.removeById("number4113142680")

  // remove field
  collection.fields.removeById("date3060926358")

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1956828121")

  // update collection data
  unmarshal({
    "name": "pricing"
  }, collection)

  // add field
  collection.fields.addAt(4, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text1841317061",
    "max": 0,
    "min": 0,
    "name": "group",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(5, new Field({
    "hidden": false,
    "id": "number4113142680",
    "max": null,
    "min": null,
    "name": "order",
    "onlyInt": true,
    "presentable": false,
    "required": true,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(6, new Field({
    "hidden": false,
    "id": "date3060926358",
    "max": "",
    "min": "",
    "name": "lastUsed",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "date"
  }))

  return app.save(collection)
})
