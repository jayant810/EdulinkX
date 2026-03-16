const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Determine folder based on route or file type
    let folder = 'edulinkx/general';
    if (req.path.includes('lecture')) folder = 'edulinkx/lectures';
    if (req.path.includes('assignment')) folder = 'edulinkx/assignments';
    if (req.path.includes('answer-key')) folder = 'edulinkx/answer-keys';

    return {
      folder: folder,
      resource_type: 'auto', // Important for PDFs/Videos
      public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
    };
  },
});

const cloudinaryUpload = multer({ storage: storage });

/**
 * Manual upload for existing local files
 */
async function uploadToCloudinary(filePath, folder = 'edulinkx/general') {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      resource_type: 'auto'
    });
    return {
      url: result.secure_url,
      id: result.public_id
    };
  } catch (err) {
    console.error('[Cloudinary] Manual Upload Error:', err.message);
    return null;
  }
}

module.exports = { cloudinary, cloudinaryUpload, uploadToCloudinary };
