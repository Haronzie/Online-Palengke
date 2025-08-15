const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const {
  getWishlist,
  addItemToWishlist,
  removeItemFromWishlist,
  clearWishlist,
} = require('../controllers/wishlistController');

router.route('/').get(isAuthenticated, getWishlist).post(isAuthenticated, addItemToWishlist).delete(isAuthenticated, clearWishlist);
router.route('/:productId').delete(isAuthenticated, removeItemFromWishlist);

module.exports = router;
