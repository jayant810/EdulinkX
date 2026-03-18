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

    let resource_type = 'auto';
    let public_id = `${Date.now()}-${file.originalname.split('.')[0]}`;

    if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
      resource_type = 'raw';
      public_id = `${public_id}.pdf`;
    }

    return {
      folder: folder,
      resource_type: resource_type,
      public_id: public_id,
    };
  },
});

const cloudinaryUpload = multer({ storage: storage });

/**
 * Manual upload for existing local files
 */
async function uploadToCloudinary(filePath, folder = 'edulinkx/general') {
  try {
    const isPdf = filePath.toLowerCase().endsWith('.pdf');
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      resource_type: isPdf ? 'raw' : 'auto',
      public_id: isPdf ? `${Date.now()}-${filePath.split('/').pop().split('\\').pop()}` : undefined
    });
    
    // Explicitly generate a signed URL to bypass Cloudinary's strict "Do not allow PDF delivery" security
    const signedUrl = cloudinary.url(result.public_id, { 
      secure: true, 
      resource_type: isPdf ? 'raw' : 'image', 
      sign_url: true 
    });

    return {
      url: signedUrl,
      id: result.public_id
    };
  } catch (err) {
    console.error('[Cloudinary] Manual Upload Error:', err.message);
    return null;
  }
}

/**
 * Generates a signed URL manually from a Cloudinary file response
 */
function getSignedCloudinaryUrl(file) {
  const isRaw = file.path && file.path.includes('/raw/');
  return cloudinary.url(file.filename, {
    secure: true,
    resource_type: isRaw ? 'raw' : 'image',
    sign_url: true
  });
}

module.exports = { cloudinary, cloudinaryUpload, uploadToCloudinary, getSignedCloudinaryUrl };
