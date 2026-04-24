const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const path = require("path"); // Add this
const cors = require("cors");
const connectDB = require("./config/db");

// Routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

connectDB();

const app = express();

const corsOptions = {
    origin: process.env.NODE_ENV === "production" ?
        process.env.FRONTEND_URL : "http://localhost:5173",
    credentials: true,
};

// Middleware
app.use(express.json());
app.use(cors(corsOptions));

// ─── STATIC FOLDER FOR IMAGES ──────────────────────────────────────────
// This allows your frontend to actually see the images in your 'uploads' folder
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/upload", uploadRoutes);

app.get("/", (req, res) => {
    res.send("API is running...");
});

// ─── ERROR HANDLING MIDDLEWARE (CRITICAL) ─────────────────────────────
// This ensures that if the server crashes, it sends JSON, not an HTML page
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        message: err.message,
        stack: process.env.NODE_ENV === "production" ? null : err.stack,
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});