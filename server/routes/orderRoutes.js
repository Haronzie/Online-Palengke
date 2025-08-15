const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { isAuthenticated, authorizeRoles } = require('../middleware/auth');
const orderController = require('../controllers/orderController');

// Input validation
const validateOrder = [
  body('orderItems')
    .isArray({ min: 1 }).withMessage('At least one order item is required'),
  body('orderItems.*.product')
    .notEmpty().withMessage('Product ID is required')
    .isMongoId().withMessage('Invalid product ID'),
  body('orderItems.*.quantity')
    .isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('shippingInfo')
    .isObject().withMessage('Shipping info is required'),
  body('shippingInfo.address')
    .notEmpty().withMessage('Address is required'),
  body('shippingInfo.city')
    .notEmpty().withMessage('City is required'),
  body('shippingInfo.postalCode')
    .notEmpty().withMessage('Postal code is required'),
  body('shippingInfo.country')
    .notEmpty().withMessage('Country is required'),
  body('shippingInfo.phone')
    .notEmpty().withMessage('Phone number is required'),
  body('paymentMethod')
    .notEmpty().withMessage('Payment method is required')
    .isIn(['cod', 'card', 'gcash', 'paymaya']).withMessage('Invalid payment method'),
  body('itemsPrice')
    .isFloat({ min: 0 }).withMessage('Invalid items price'),
  body('taxPrice')
    .isFloat({ min: 0 }).withMessage('Invalid tax price'),
  body('shippingPrice')
    .isFloat({ min: 0 }).withMessage('Invalid shipping price'),
  body('totalPrice')
    .isFloat({ min: 0 }).withMessage('Invalid total price'),
  body('notes')
    .optional()
    .isString().withMessage('Notes must be a string')
    .isLength({ max: 1000 }).withMessage('Notes cannot be longer than 1000 characters')
];

const validateOrderStatus = [
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn([
      'pending',
      'processing',
      'shipped',
      'delivered',
      'cancelled',
      'refunded'
    ]).withMessage('Invalid status')
];

// Public routes (none for orders)

// Protected routes
router.use(isAuthenticated);

// Customer routes
router.post(
  '/',
  validateOrder,
  orderController.createOrder
);

router.get(
  '/myorders',
  orderController.getMyOrders
);

router.get(
  '/:id',
  orderController.getOrderById
);

// Payment processing
router.post(
  '/:id/pay',
  orderController.processPayment
);

// Vendor/Admin routes
router.get(
  '/',
  authorizeRoles('vendor', 'admin'),
  orderController.getAllOrders
);

router.put(
  '/:id/status',
  authorizeRoles('vendor', 'admin'),
  validateOrderStatus,
  orderController.updateOrderStatus
);

// Admin routes
router.get(
  '/sales/stats',
  authorizeRoles('admin', 'vendor'),
  orderController.getSalesStats
);

module.exports = router;
