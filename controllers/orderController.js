const Order = require("../models/Order");

const Product = require("../models/Product");

exports.createOrder = async(req, res) => {
    try {
        const { orderItems, shippingAddress, totalPrice } = req.body;

        if (!orderItems || orderItems.length === 0) {
            return res.status(400).json({ message: "No order items" });
        }

        // 🔥 UPDATE STOCK HERE
        for (const item of orderItems) {
            const product = await Product.findById(item.product);

            if (!product) {
                return res.status(404).json({ message: "Product not found" });
            }

            if (product.countInStock < item.qty) {
                return res.status(400).json({ message: "Not enough stock" });
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

// GET logged-in user's orders
exports.getMyOrders = async(req, res) => {
    const orders = await Order.find({ user: req.user._id });
    res.json(orders);
};

// MARK ORDER AS PAID
exports.updateOrderToPaid = async(req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            order.isPaid = true;
            order.paidAt = Date.now();

            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: "Order not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET all orders (ADMIN)
exports.getOrders = async(req, res) => {
    const orders = await Order.find().populate("user", "id name");
    res.json(orders);
};