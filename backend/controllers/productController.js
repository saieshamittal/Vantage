const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../models/productModel");

// GET /api/products
// Supports optional query params: ?search=shirt&category=clothing
const getAllProducts = async (req, res) => {
  const { company_id } = req.user;
  const { search, category } = req.query;

  try {
    const products = await getProducts(company_id, search, category);
    res.json(products);
  } catch (err) {
    console.error("Get products error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/products/:id
const getOneProduct = async (req, res) => {
  const { company_id } = req.user;
  const { id } = req.params;

  try {
    const product = await getProductById(id, company_id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (err) {
    console.error("Get product error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/products
const addProduct = async (req, res) => {
  const { company_id } = req.user;
  const { name, price, stock, category } = req.body;

  if (!name || price === undefined || stock === undefined) {
    return res.status(400).json({ message: "name, price, and stock are required" });
  }

  try {
    const product = await createProduct(name, price, stock, category || null, company_id);
    res.status(201).json(product);
  } catch (err) {
    console.error("Add product error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/products/:id
const editProduct = async (req, res) => {
  const { company_id } = req.user;
  const { id } = req.params;
  const { name, price, stock, category } = req.body;

  if (!name || price === undefined || stock === undefined) {
    return res.status(400).json({ message: "name, price, and stock are required" });
  }

  try {
    const product = await updateProduct(id, company_id, { name, price, stock, category: category || null });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (err) {
    console.error("Edit product error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/products/:id
const removeProduct = async (req, res) => {
  const { company_id } = req.user;
  const { id } = req.params;

  try {
    const product = await deleteProduct(id, company_id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ message: "Product deleted", product });
  } catch (err) {
    console.error("Delete product error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getAllProducts, getOneProduct, addProduct, editProduct, removeProduct };
