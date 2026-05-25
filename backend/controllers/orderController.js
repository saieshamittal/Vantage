const pool = require("../config/db");
const { getOrders, getOrderById, createOrder, deductStock } = require("../models/orderModel");
const { getProductById } = require("../models/productModel");

// GET /api/orders
const getAllOrders = async (req, res) => {
  const { company_id } = req.user;

  try {
    const orders = await getOrders(company_id);
    res.json(orders);
  } catch (err) {
    console.error("Get orders error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/orders/:id
const getOneOrder = async (req, res) => {
  const { company_id } = req.user;
  const { id } = req.params;

  try {
    const order = await getOrderById(id, company_id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json(order);
  } catch (err) {
    console.error("Get order error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/orders
// Places an order and deducts stock atomically using a transaction
const placeOrder = async (req, res) => {
  const { company_id } = req.user;
  const { product_id, quantity } = req.body;

  if (!product_id || !quantity || quantity <= 0) {
    return res.status(400).json({ message: "product_id and a positive quantity are required" });
  }

  // Get a dedicated client from the pool for the transaction
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Verify the product exists and belongs to this company
    const product = await getProductById(product_id, company_id);
    if (!product) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Product not found" });
    }

    // Check there is enough stock
    if (product.stock < quantity) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        message: `Insufficient stock. Available: ${product.stock}`,
      });
    }

    // Deduct stock
    const updatedProduct = await deductStock(client, product_id, quantity, company_id);
    if (!updatedProduct) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Stock deduction failed" });
    }

    // Calculate total and create the order
    const total_price = product.price * quantity;
    const order = await createOrder(product_id, quantity, total_price, company_id);

    await client.query("COMMIT");

    res.status(201).json({
      message: "Order placed successfully",
      order,
      remaining_stock: updatedProduct.stock,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Place order error:", err.message);
    res.status(500).json({ message: "Server error" });
  } finally {
    // Always release the client back to the pool
    client.release();
  }
};

module.exports = { getAllOrders, getOneOrder, placeOrder };
