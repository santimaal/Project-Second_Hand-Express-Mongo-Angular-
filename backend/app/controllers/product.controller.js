const { product } = require("../models");
const db = require("../models");
const mongoose = require('mongoose');
var Product = mongoose.model('product');
var Category = mongoose.model('category');
const serializeProduct = require("./serializers/product_serializers")

// Create and Save a new Product
exports.create = async (req, res) => {
  if (!req.body.prod_nom) {
    res.status(400).send({ message: "Content can not be empty!" });
    return;
  }
  try {
    let product = new Product({
      prod_nom: req.body.prod_nom || null,
      slug: req.body.slug || null,
      id_prod_typ: req.body.id_prod_typ || null,
      prod_desc: req.body.prod_desc || null,
      price: req.body.price || null,
      id_prod_cat: req.body.id_prod_cat || null,
      location: req.body.location || null,
      quality: req.body.quality || null,
      img_prod: req.body.img_prod || null
    });

    // No se puede insertar con el push el slug porque debe de ser un objectID,
    const category = await Category.updateOne(
      { slug: product.id_prod_cat },
      { $push: { products: product._id } }
    );

    await product.save();
    res.json({ product: product.toJSONFor() })
  } catch (error) {
    console.log(error);
    res.status(500).send('You have error in Create and Save Product');
  }
}

// Find all Products from the database.
exports.findAll = async (req, res) => {

  try {

    let query = {};
    let transUndefined = (varQuery, otherResult) => {
      return varQuery != "undefined" && varQuery ? varQuery : otherResult;
    };

    //declaration all parameters query
    let limit = transUndefined(req.query.limit, 2);
    let offset = transUndefined(req.query.offset, 0);

    //¡IMPORTANTE! --> pasar la query de los filtros dependiendo de si los tenemos marcados o no
    query = {};

    const data_products = await Product.find(query)
      .sort("price")
      .limit(Number(limit))
      .skip(Number(offset));
    const QuantityProducts = await Product.find(query).countDocuments();

    if (!data_products) {
      res.status(404).json({ msg: "No existe el product" });
    }

    res.json(serializeProduct.serializeProductsAllFilter(data_products, QuantityProducts));

  } catch (error) {
    res.status(500).send({
      message:
        error.message || "Some error occurred while retrieving tutorials."
    });
  }
};

// Find a one Product with an id
exports.findOne = async (req, res) => {
  const id = req.params.id;
  try {
    let product = await Product.findOne({ slug: id })
    if (!product)
      res.status(404).send({ message: "Not found Product with id " + id });
    else {
      res.send(product.toJSONFor());
      // res.json(serializeProduct.serializeOneProduct(product));
    }
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error retrieving Tutorial with id=" + id });
  }
};
// Update a Products by the id in the request
exports.update = async (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Data to update can not be empty!"
    });
  }
  try {
    let old_product = await Product.findOne({ slug: req.params.id });
    // console.log(product);
    if (old_product.prod_nom !== req.body.prod_nom && req.body.prod_nom !== undefined) {
      old_product.slug = null;
    }//end if
    old_product.prod_nom = req.body.prod_nom || old_product.prod_nom;
    old_product.id_prod_typ = req.body.id_prod_typ || old_product.id_prod_typ;
    old_product.price = req.body.price || old_product.price;
    old_product.location = req.body.location || old_product.location;
    old_product.quality = req.body.quality || old_product.quality;
    old_product.id_prod_cat = req.body.id_prod_cat || old_product.id_prod_cat;
    old_product.img_prod = req.body.img_prod || old_product.img_prod;


    const product = await old_product.save();
    if (!product) { res.status(404).json(FormatError("Product not found", res.statusCode)); }
    res.json({ msg: "Product updated" })
  } catch (error) {
    res.status(404).send({
      message: `Cannot update Product with id=${req.params.id}. Maybe Product was not found!`
    });
  }
};

// Delete a Products with the specified id in the request
exports.delete = async (req, res) => {
  const id = req.params.id;
  try {

    let product = await Product.findOneAndDelete({ slug: req.params.id });

    if (!product) {
      res.status(404).json({ msg: 'No existe el producto' })
    }

    res.send({ msg: 'Product eliminado con éxito!' })


  } catch (error) {
    res.status(404).send({
      message: `Cannot delete Product with id=${id}. Maybe Product was not found!`
    });
  }
};

// Delete all Products from the database.
exports.deleteAll = async (req, res) => {
  try {
    const deleteALL = await Product.collection.drop();
    res.send({ msg: 'Product were deleted successfully' })
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message:
        err.message || "Some error occurred while removing all product."
    });
  }
}

// Find all published Products
exports.findAllPublished = (req, res) => {
  Product.find({ published: true })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials."
      });
    });
};
