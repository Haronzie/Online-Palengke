const express = require('express');
const router = express.Router();
const { isAuthenticated, authorizeRoles } = require('../middleware/auth');
const {
  createReview,
  getProductReviews,
  getSingleReview,
  updateReview,
  deleteReview,
} = require('../controllers/reviewController');

router.route('/:productId/reviews').post(isAuthenticated, createReview).get(getProductReviews);
router.route('/:id').get(getSingleReview).put(isAuthenticated, updateReview).delete(isAuthenticated, deleteReview);

module.exports = router;