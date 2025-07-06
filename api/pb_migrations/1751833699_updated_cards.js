/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3219110441")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE UNIQUE INDEX `unique_condition_number_set_order` ON `cards` (\n  `condition`,\n  `number`,\n  `set`,\n  `order`,\n  `name`\n)"
    ]
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3219110441")

  // update collection data
  unmarshal({
    "indexes": []
  }, collection)

  return app.save(collection)
})
