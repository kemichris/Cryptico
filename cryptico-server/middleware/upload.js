const multer = require('multer');
const path = require('path');

// where to store uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '../assets/uploads/');
  },
  filename: (req, file, cb) => {
    // unique filename → timestamp + original name
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// only allow images
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;