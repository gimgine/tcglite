/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3219110441")

  // update collection data
  unmarshal({
    "indexes": []
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3219110441")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE UNIQUE INDEX `unique_card_number_set_quantity_order` ON `cards` (\n  `number`,\n  `set`,\n  `quantity`,\n  `order`\n)"
    ]
  }, collection)

  return app.save(collection)
})
