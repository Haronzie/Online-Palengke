const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { isAuthenticated, authorizeRoles } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  updateMe,
  getVendorProfile,
  updateVendorProfile,
  uploadVendorDocuments,
  getMyOrders,
  getMyReviews,
  updatePreferences
} = require('../controllers/userController');

// Validation middleware
const validateVendorUpdate = [
  body('storeName')
    .optional()
    .trim()
    .notEmpty().withMessage('Store name is required')
    .isLength({ max: 100 }).withMessage('Store name cannot be more than 100 characters'),
  body('storeDescription')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Description cannot be more than 1000 characters'),
  body('phone')
    .optional()
    .trim()
    .matches(/^[0-9\-\+\s]+$/).withMessage('Please enter a valid phone number'),
  body('address')
    .optional()
    .isObject().withMessage('Address must be an object')
];

// Public routes
router.get('/vendor/:id', getVendorProfile);

// Protected routes (require authentication)
router.use(isAuthenticated);

// User profile routes
router.put('/me', upload.single('avatar'), updateMe);
router.get('/me/orders', getMyOrders);
router.get('/me/reviews', getMyReviews);
router.put('/me/preferences', updatePreferences);

// Vendor routes
router.put('/vendor/update', validateVendorUpdate, updateVendorProfile);
router.put('/vendor/documents', upload.array('documents', 5), uploadVendorDocuments);

// Admin routes (require admin role)
router.use(authorizeRoles('admin'));

router.get('/', getUsers);
router.get('/:id', getUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
