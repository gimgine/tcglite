/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3527180448")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.store.id = store",
    "deleteRule": "@request.auth.store.id = store",
    "listRule": "@request.auth.store.id = store",
    "updateRule": "@request.auth.store.id = store",
    "viewRule": "@request.auth.store.id = store"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3527180448")

  // update collection data
  unmarshal({
    "createRule": "",
    "deleteRule": null,
    "listRule": "",
    "updateRule": "",
    "viewRule": null
  }, collection)

  return app.save(collection)
})
