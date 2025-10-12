/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_4092854851")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE UNIQUE INDEX `idx_pMUzjQSCTh` ON `products` (\n  `store`,\n  `tcgPlayerId`\n)"
    ]
  }, collection)

  // update field
  collection.fields.addAt(10, new Field({
    "hidden": false,
    "id": "number3228287169",
    "max": null,
    "min": null,
    "name": "tcgPlayerId",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_4092854851")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE UNIQUE INDEX `idx_pMUzjQSCTh` ON `products` (\n  `store`,\n  `tcgplayerId`\n)"
    ]
  }, collection)

  // update field
  collection.fields.addAt(10, new Field({
    "hidden": false,
    "id": "number3228287169",
    "max": null,
    "min": null,
    "name": "tcgplayerId",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
})
