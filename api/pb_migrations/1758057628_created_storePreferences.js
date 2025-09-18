/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    "createRule": null,
    "deleteRule": null,
    "fields": [
      {
        "autogeneratePattern": "[a-z0-9]{15}",
        "hidden": false,
        "id": "text3208210256",
        "max": 15,
        "min": 15,
        "name": "id",
        "pattern": "^[a-z0-9]+$",
        "presentable": false,
        "primaryKey": true,
        "required": true,
        "system": true,
        "type": "text"
      },
      {
        "cascadeDelete": false,
        "collectionId": "pbc_3800236418",
        "hidden": false,
        "id": "relation4283914359",
        "maxSelect": 1,
        "minSelect": 0,
        "name": "store",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "relation"
      },
      {
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
      },
      {
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
      },
      {
        "hidden": false,
        "id": "autodate2990389176",
        "name": "created",
        "onCreate": true,
        "onUpdate": false,
        "presentable": false,
        "system": false,
        "type": "autodate"
      },
      {
        "hidden": false,
        "id": "autodate3332085495",
        "name": "updated",
        "onCreate": true,
        "onUpdate": true,
        "presentable": false,
        "system": false,
        "type": "autodate"
      }
    ],
    "id": "pbc_1012939826",
    "indexes": [],
    "listRule": null,
    "name": "storePreferences",
    "system": false,
    "type": "base",
    "updateRule": null,
    "viewRule": null
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1012939826");

  return app.delete(collection);
})
