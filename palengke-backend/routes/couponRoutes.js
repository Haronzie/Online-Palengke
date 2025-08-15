const express = require('express');
const router = express.Router();
const { isAuthenticated, authorizeRoles } = require('../middleware/auth');
const {
  createCoupon,
  getAllCoupons,
  getCouponById,
  validateCoupon,
  deleteCoupon,
} = require('../controllers/couponController');

router.route('/').post(isAuthenticated, authorizeRoles('admin'), createCoupon).get(isAuthenticated, authorizeRoles('admin'), getAllCoupons);
router.route('/:id').get(isAuthenticated, authorizeRoles('admin'), getCouponById).delete(isAuthenticated, authorizeRoles('admin'), deleteCoupon);
router.route('/validate/:code').get(validateCoupon);

module.exports = router;
