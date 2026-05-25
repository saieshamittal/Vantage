const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Initialize DB connection (runs the connect test)
require("./config/db");
const { ensureDefaultAdmin } = require("./services/bootstrapService");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const predictionRoutes = require("./routes/predictionRoutes");
const insightsRoutes = require("./routes/insightsRoutes");
const alertsRoutes = require("./routes/alertsRoutes");
const adminRoutes = require("./routes/adminRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/predictions", predictionRoutes);
app.use("/api/insights", insightsRoutes);
app.use("/api/alerts", alertsRoutes);
app.use("/api/admin", adminRoutes);

// Health check route
app.get("/", (req, res) => {
  res.json({ message: "Vantage API is running" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  await ensureDefaultAdmin();
  console.log(`Server running on port ${PORT}`);
});
