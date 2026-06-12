const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');

// Ensure local upload directory exists
const uploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Disk Storage Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// File upload restrictions
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Max 10MB files
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|pdf|zip/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images, PDFs, or zip reports are allowed!'));
    }
  },
});

// Helper function to process upload (Cloudinary vs Local)
const uploadFile = async (file) => {
  if (!file) return null;

  try {
    if (isCloudinaryConfigured) {
      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'dental_clinic',
        resource_type: 'auto',
      });
      // Delete temporary local file
      try {
        fs.unlinkSync(file.path);
      } catch (err) {
        console.error('Failed to delete temp file:', err.message);
      }
      return {
        url: result.secure_url,
        public_id: result.public_id,
      };
    } else {
      // Local fallback url path relative to server root
      const filename = path.basename(file.path);
      return {
        url: `/uploads/${filename}`,
        public_id: `local-${filename}`,
      };
    }
  } catch (error) {
    console.error('Upload processor error:', error);
    throw new Error('File upload processing failed.');
  }
};

module.exports = {
  upload,
  uploadFile,
};
