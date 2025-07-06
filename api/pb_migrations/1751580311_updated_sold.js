/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3219110441")

  // update collection data
  unmarshal({
    "name": "cards"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3219110441")

  // update collection data
  unmarshal({
    "name": "sold"
  }, collection)

  return app.save(collection)
})
