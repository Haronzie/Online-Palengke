const Review = require('../models/Review');
const Product = require('../models/Product');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, NotFoundError, UnauthorizedError } = require('../errors');
const asyncHandler = require('express-async-handler');

// @desc    Create new review
// @route   POST /api/products/:productId/reviews
// @access  Private
exports.createReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const { productId } = req.params;

  if (!rating || !comment) {
    throw new BadRequestError('Please provide rating and comment');
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw new NotFoundError('Product not found');
  }

  // Check if user already reviewed this product
  const alreadyReviewed = await Review.findOne({
    product: productId,
    user: req.user.id,
  });

  if (alreadyReviewed) {
    throw new BadRequestError('You have already reviewed this product');
  }

  const review = await Review.create({
    rating,
    comment,
    product: productId,
    user: req.user.id,
  });

  // Update product's average rating and number of reviews
  product.reviews.push(review._id);
  product.numOfReviews = product.reviews.length;
  product.averageRating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

  await product.save({ validateBeforeSave: false });

  res.status(StatusCodes.CREATED).json({
    success: true,
    data: review,
  });
});

// @desc    Get all reviews for a product
// @route   GET /api/products/:productId/reviews
// @access  Public
exports.getProductReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId }).populate('user', 'name avatar');

  res.status(StatusCodes.OK).json({
    success: true,
    count: reviews.length,
    data: reviews,
  });
});

// @desc    Get single review
// @route   GET /api/reviews/:id
// @access  Public
exports.getSingleReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id).populate('user', 'name avatar').populate('product', 'name images');

  if (!review) {
    throw new NotFoundError(`No review found with id ${req.params.id}`);
  }

  res.status(StatusCodes.OK).json({
    success: true,
    data: review,
  });
});

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
exports.updateReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  let review = await Review.findById(req.params.id);

  if (!review) {
    throw new NotFoundError(`No review found with id ${req.params.id}`);
  }

  // Check if review belongs to user
  if (review.user.toString() !== req.user.id) {
    throw new UnauthorizedError('Not authorized to update this review');
  }

  review.rating = rating || review.rating;
  review.comment = comment || review.comment;

  await review.save();

  // Recalculate product average rating
  const product = await Product.findById(review.product);
  product.averageRating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;
  await product.save({ validateBeforeSave: false });

  res.status(StatusCodes.OK).json({
    success: true,
    data: review,
  });
});

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    throw new NotFoundError(`No review found with id ${req.params.id}`);
  }

  // Check if review belongs to user or if user is admin
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    throw new UnauthorizedError('Not authorized to delete this review');
  }

  await review.remove();

  // Update product's average rating and number of reviews
  const product = await Product.findById(review.product);
  product.reviews = product.reviews.filter(item => item.toString() !== review._id.toString());
  product.numOfReviews = product.reviews.length;
  product.averageRating = product.reviews.length > 0 ? product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length : 0;

  await product.save({ validateBeforeSave: false });

  res.status(StatusCodes.OK).json({
    success: true,
    data: {},
  });
});
