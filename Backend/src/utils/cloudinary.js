const cloudinary = require("cloudinary").v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a file buffer or URL to Cloudinary.
 * @param {string|Buffer} source - Data URI, remote URL, or local path
 * @param {object} options - Cloudinary upload options (folder, resource_type, etc.)
 * @returns {Promise<object>} Cloudinary upload result
 */
async function uploadToCloudinary(source, options = {}) {
    const defaultOptions = {
        folder: "lovenest",
        resource_type: "auto",
        ...options,
    };
    return cloudinary.uploader.upload(source, defaultOptions);
}

/**
 * Delete an asset by its public_id.
 * @param {string} publicId
 * @param {string} resourceType - 'image' | 'video' | 'raw'
 */
async function deleteFromCloudinary(publicId, resourceType = "image") {
    return cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}

module.exports = { cloudinary, uploadToCloudinary, deleteFromCloudinary };
