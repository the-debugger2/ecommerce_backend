const User = require("../models/User");

// Get logged in user profile
exports.getUserProfile = async(req, res) => {
    res.json(req.user);
};