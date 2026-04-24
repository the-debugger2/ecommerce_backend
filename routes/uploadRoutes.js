// ─── uploadRoutes.js ──────────────────────────────────────────────────────
// Place this file at: routes/uploadRoutes.js

const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");

// POST /api/upload
// Accepts a single file field named "image"
// Returns { url } — save this URL as the product's image field
router.post("/", upload.single("image"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }

    // Cloudinary gives us the URL on req.file.path
    res.json({ url: req.file.path });
});

module.exports = router;