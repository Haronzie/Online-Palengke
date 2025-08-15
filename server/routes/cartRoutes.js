const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const {
  getCart,
  addItemToCart,
  removeItemFromCart,
  updateCartItemQuantity,
  clearCart,
} = require('../controllers/cartController');

router.route('/').get(isAuthenticated, getCart).post(isAuthenticated, addItemToCart).delete(isAuthenticated, clearCart);
router.route('/:productId').delete(isAuthenticated, removeItemFromCart).put(isAuthenticated, updateCartItemQuantity);

module.exports = router;
