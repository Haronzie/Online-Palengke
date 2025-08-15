const multer = require('multer');
const { BadRequestError } = require('../errors');

// Use memory storage to handle files as buffers
const storage = multer.memoryStorage();

// File filter for images
const imageFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new BadRequestError('Only image files are allowed'), false);
  }
};

// Initialize upload
const upload = multer({
  storage: storage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

module.exports = upload;