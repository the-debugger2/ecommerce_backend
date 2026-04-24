const express = require("express");
const router = express.Router();
const {
    createOrder,
    getMyOrders,
    getOrders,
    updateOrderToPaid,
} = require("../controllers/orderController");

const { protect, admin } = require("../middleware/authMiddleware");

// Create order
router.post("/", protect, createOrder);

// Get logged-in user's orders
router.get("/myorders", protect, getMyOrders);

// Mark as paid
router.put("/:id/pay", protect, updateOrderToPaid);

// Admin: get all orders
router.get("/", protect, admin, getOrders);

module.exports = router;