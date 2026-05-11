const Order = require("../models/Order");
const Product = require("../models/Product");
const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// CREATE ORDER
exports.createOrder = async(req, res) => {
    try {
        const { orderItems, shippingAddress, totalPrice } = req.body;

        if (!orderItems || orderItems.length === 0) {
            return res.status(400).json({ message: "No order items" });
        }

        for (const item of orderItems) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(404).json({ message: "Product not found" });
            }
            if (product.countInStock < item.qty) {
                return res.status(400).json({ message: `Not enough stock for ${product.name}` });
            }
            product.countInStock -= item.qty;
            await product.save();
        }

        const order = new Order({
            user: req.user._id,
            orderItems,
            shippingAddress,
            totalPrice,
        });

        const createdOrder = await order.save();
        res.status(201).json(createdOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// CREATE STRIPE PAYMENT INTENT
// POST /api/orders/:id/payment-intent
exports.createPaymentIntent = async(req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) return res.status(404).json({ message: "Order not found" });
        if (order.isPaid) return res.status(400).json({ message: "Order already paid" });

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(order.totalPrice * 100), // cents
            currency: "usd",
            metadata: {
                orderId: order._id.toString(),
                userId: req.user._id.toString(),
            },
        });

        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// VERIFY STRIPE PAYMENT & MARK ORDER AS PAID
// PUT /api/orders/:id/pay  { paymentIntentId }
exports.updateOrderToPaid = async(req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) return res.status(404).json({ message: "Order not found" });
        if (order.isPaid) return res.status(400).json({ message: "Order already paid" });

        const { paymentIntentId } = req.body;

        if (!paymentIntentId) {
            return res.status(400).json({ message: "Payment intent ID required" });
        }

        // Always verify server-side — never trust the client
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        if (paymentIntent.status !== "succeeded") {
            return res.status(400).json({ message: `Payment not successful. Status: ${paymentIntent.status}` });
        }

        if (paymentIntent.metadata.orderId !== order._id.toString()) {
            return res.status(400).json({ message: "Payment intent does not match this order" });
        }

        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = {
            id: paymentIntent.id,
            status: paymentIntent.status,
            amount: paymentIntent.amount / 100,
            currency: paymentIntent.currency,
        };

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } catch (error) {
        console.error("Stripe verification error:", error.message);
        res.status(500).json({ message: "Payment verification failed" });
    }
};

// MARK ORDER AS DELIVERED (Admin)
// PUT /api/orders/:id/deliver
exports.updateOrderToDelivered = async(req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        order.isDelivered = true;
        order.deliveredAt = Date.now();

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET logged-in user's orders
exports.getMyOrders = async(req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET all orders (ADMIN)
exports.getOrders = async(req, res) => {
    try {
        const orders = await Order.find().populate("user", "id name email");
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};