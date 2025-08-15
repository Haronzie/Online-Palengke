const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { isAuthenticated, authorizeRoles } = require('../middleware/auth');
const upload = require('../middleware/upload');
const productController = require('../controllers/productController');

// Input validation
const validateProduct = [
  body('name')
    .trim()
    .notEmpty().withMessage('Product name is required')
    .isLength({ max: 200 }).withMessage('Name cannot be more than 200 characters'),
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ max: 2000 }).withMessage('Description cannot be more than 2000 characters'),
  body('price')
    .isFloat({ min: 0.01 }).withMessage('Price must be greater than 0')
    .toFloat(),
  body('originalPrice')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0.01 }).withMessage('Original price must be greater than 0')
    .toFloat(),
  body('category')
    .isIn(['fruits', 'vegetables', 'meat', 'seafood', 'dairy', 'bakery', 'beverages', 'snacks', 'household', 'other'])
    .withMessage('Invalid category'),
  body('stock')
    .isInt({ min: 0 }).withMessage('Stock must be a positive number')
    .toInt(),
  body('isFeatured')
    .optional()
    .isBoolean().withMessage('isFeatured must be a boolean')
    .toBoolean(),
  body('isNew')
    .optional()
    .isBoolean().withMessage('isNew must be a boolean')
    .toBoolean(),
  body('deliveryTime')
    .optional()
    .isIn(['1-2 days', '3-4 days', '5-7 days', '1-2 weeks', '2-4 weeks', '1-2 months'])
    .withMessage('Invalid delivery time'),
  body('tags')
    .optional()
    .isArray().withMessage('Tags must be an array'),
  body('specifications')
    .optional()
    .isObject().withMessage('Specifications must be an object')
];

// Public routes
router.get('/', productController.getProducts);
router.get('/top', productController.getTopProducts);
router.get('/:id', productController.getProduct);

// Protected routes (require authentication)
router.use(isAuthenticated);

// Vendor routes (only vendors can create/update/delete their own products)
router.post(
  '/',
  authorizeRoles('vendor', 'admin'),
  validateProduct,
  productController.createProduct
);

router.put(
  '/:id',
  authorizeRoles('vendor', 'admin'),
  validateProduct,
  productController.updateProduct
);

router.delete(
  '/:id',
  authorizeRoles('vendor', 'admin'),
  productController.deleteProduct
);

// Image upload routes
router.put(
  '/:id/images',
  authorizeRoles('vendor', 'admin'),
  upload.array('images', 5), // Max 5 images
  productController.uploadProductImages
);

router.delete(
  '/:id/images/:imageId',
  authorizeRoles('vendor', 'admin'),
  productController.deleteProductImage
);

// Stock management
router.put(
  '/:id/stock',
  authorizeRoles('vendor', 'admin'),
  [
    body('quantity')
      .isNumeric().withMessage('Quantity must be a number')
      .toFloat(),
    body('operation')
      .optional()
      .isIn(['add', 'subtract', 'set'])
      .withMessage('Operation must be one of: add, subtract, set')
  ],
  productController.updateProductStock
);

// Admin routes (for managing all products)
router.get(
  '/admin/all',
  authorizeRoles('admin'),
  productController.adminGetAllProducts
);

module.exports = router;
