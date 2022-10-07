var router = require("express").Router();

const product = require("../../controllers/product.controller.js");

// Create a new Product
router.post("/", product.create);

// Retrieve all product
router.get("/", product.findAll);

// Retrieve a single Product with id
router.get("/:id", product.findOne);

// Update a Product with id
router.put("/:id", product.update);

// Delete a Product with id
router.delete("/:id", product.delete);

// Create a new Product
router.delete("/", product.deleteAll);

module.exports = router;
