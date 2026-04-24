const dotenv = require("dotenv");
dotenv.config(); // ← must be before ALL other requires

const express = require("express");
const uploadRoutes = require("./routes/uploadRoutes");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");

connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/upload", uploadRoutes);

// Test route
app.get("/", (req, res) => {
    res.send("API is running...");
});

// Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});