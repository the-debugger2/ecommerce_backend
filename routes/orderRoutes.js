const express = require("express");
const router = express.Router();
const {
    createOrder,
    getMyOrders,
    getOrders,
    updateOrderToPaid,
    updateOrderToDelivered,
    createPaymentIntent, // if using Stripe
} = require("../controllers/orderController");

const { protect, admin } = require("../middleware/authMiddleware");

router.post("/", protect, createOrder);
router.get("/myorders", protect, getMyOrders);
router.post("/:id/payment-intent", protect, createPaymentIntent);
router.put("/:id/pay", protect, updateOrderToPaid);
router.put("/:id/deliver", protect, admin, updateOrderToDelivered); // ← new
router.get("/", protect, admin, getOrders);

module.exports = router;