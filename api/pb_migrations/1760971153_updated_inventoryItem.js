/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1646051791")

  // update collection data
  unmarshal({
    "name": "inventoryItems"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1646051791")

  // update collection data
  unmarshal({
    "name": "inventoryItem"
  }, collection)

  return app.save(collection)
})
