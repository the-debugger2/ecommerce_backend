const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

// Move config inside a function so it runs at request time, not import time
const getStorage = () => {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    return new CloudinaryStorage({
        cloudinary,
        params: {
            folder: "products",
            allowed_formats: ["jpg", "jpeg", "png", "webp"],
            transformation: [{ width: 800, height: 800, crop: "limit" }],
        },
    });
};

const upload = multer({
    storage: getStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = upload;