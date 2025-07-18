/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3011519073")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE UNIQUE INDEX `idx_cjALO5CSeS` ON `sets` (\n  `code`,\n  `tcgplayer`\n)"
    ]
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3011519073")

  // update collection data
  unmarshal({
    "indexes": []
  }, collection)

  return app.save(collection)
})
