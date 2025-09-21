/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1012939826")

  // remove field
  collection.fields.removeById("select1542800728")

  // remove field
  collection.fields.removeById("text494360628")

  // add field
  collection.fields.addAt(2, new Field({
    "hidden": false,
    "id": "number934669518",
    "max": null,
    "min": null,
    "name": "oneOunceCards",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(3, new Field({
    "hidden": false,
    "id": "number1821328017",
    "max": null,
    "min": null,
    "name": "oneOunceCost",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "number392526430",
    "max": null,
    "min": null,
    "name": "twoOunceCards",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(5, new Field({
    "hidden": false,
    "id": "number3550241252",
    "max": null,
    "min": null,
    "name": "twoOunceCost",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(6, new Field({
    "hidden": false,
    "id": "number1578100177",
    "max": null,
    "min": null,
    "name": "threeOunceCards",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(7, new Field({
    "hidden": false,
    "id": "number3494159106",
    "max": null,
    "min": null,
    "name": "threeOunceCost",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(8, new Field({
    "hidden": false,
    "id": "number4112330320",
    "max": null,
    "min": null,
    "name": "moreOunceCost",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(9, new Field({
    "hidden": false,
    "id": "number1865848650",
    "max": null,
    "min": null,
    "name": "trackingThreshold",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(10, new Field({
    "hidden": false,
    "id": "number2987381131",
    "max": null,
    "min": null,
    "name": "trackingCost",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1012939826")

  // add field
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
      "twoOunceCards",
      "threeOunceCards",
      "oneOunceCost",
      "twoOunceCost",
      "threeOunceCost",
      "moreOunceCost",
      "trackingCost",
      "trackingThreshold",
      "oneOunceCards"
    ]
  }))

  // add field
  collection.fields.addAt(3, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text494360628",
    "max": 0,
    "min": 0,
    "name": "value",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // remove field
  collection.fields.removeById("number934669518")

  // remove field
  collection.fields.removeById("number1821328017")

  // remove field
  collection.fields.removeById("number392526430")

  // remove field
  collection.fields.removeById("number3550241252")

  // remove field
  collection.fields.removeById("number1578100177")

  // remove field
  collection.fields.removeById("number3494159106")

  // remove field
  collection.fields.removeById("number4112330320")

  // remove field
  collection.fields.removeById("number1865848650")

  // remove field
  collection.fields.removeById("number2987381131")

  return app.save(collection)
})
