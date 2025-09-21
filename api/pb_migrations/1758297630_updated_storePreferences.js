/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1012939826")

  // update field
  collection.fields.addAt(2, new Field({
    "hidden": false,
    "id": "select1542800728",
    "maxSelect": 1,
    "name": "field",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "oneOzCards",
      "twoOunceCards",
      "threeOunceCards",
      "oneOunceCost",
      "twoOunceCost",
      "threeOunceCost",
      "moreOunceCost",
      "trackingCost",
      "trackingThreshold"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1012939826")

  // update field
  collection.fields.addAt(2, new Field({
    "hidden": false,
    "id": "select1542800728",
    "maxSelect": 1,
    "name": "field",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "1_oz_cards",
      "2_oz_cards",
      "3_oz_cards",
      "1_oz_cost",
      "2_oz_cost",
      "3_oz_cost",
      "more_oz_cost",
      "tracking_cost",
      "tracking_threshold",
      "free_shipping_threshold"
    ]
  }))

  return app.save(collection)
})
