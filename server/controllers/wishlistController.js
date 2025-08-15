const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, NotFoundError } = require('../errors');
const asyncHandler = require('express-async-handler');

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
exports.getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.user.id }).populate('items.product', 'name price images');

  if (!wishlist) {
    return res.status(StatusCodes.OK).json({
      success: true,
      data: { items: [] }, // Return an empty wishlist if not found
    });
  }

  res.status(StatusCodes.OK).json({
    success: true,
    data: wishlist,
  });
});

// @desc    Add product to wishlist
// @route   POST /api/wishlist
// @access  Private
exports.addItemToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    throw new BadRequestError('Please provide a product ID');
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw new NotFoundError('Product not found');
  }

  let wishlist = await Wishlist.findOne({ user: req.user.id });

  if (!wishlist) {
    // Create new wishlist if it doesn't exist
    wishlist = await Wishlist.create({
      user: req.user.id,
      items: [],
    });
  }

  // Check if product already in wishlist
  const itemExists = wishlist.items.some(
    (item) => item.product.toString() === productId
  );

  if (itemExists) {
    throw new BadRequestError('Product already in wishlist');
  }

  wishlist.items.push({ product: productId });
  await wishlist.save();

  res.status(StatusCodes.CREATED).json({
    success: true,
    data: wishlist,
  });
});

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
exports.removeItemFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const wishlist = await Wishlist.findOne({ user: req.user.id });
  if (!wishlist) {
    throw new NotFoundError('Wishlist not found');
  }

  const initialLength = wishlist.items.length;
  wishlist.items = wishlist.items.filter(
    (item) => item.product.toString() !== productId
  );

  if (wishlist.items.length === initialLength) {
    throw new NotFoundError('Product not found in wishlist');
  }

  await wishlist.save();
  res.status(StatusCodes.OK).json({
    success: true,
    data: wishlist,
  });
});

// @desc    Clear user wishlist
// @route   DELETE /api/wishlist
// @access  Private
exports.clearWishlist = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.user.id });
  if (!wishlist) {
    throw new NotFoundError('Wishlist not found');
  }

  wishlist.items = [];
  await wishlist.save();

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Wishlist cleared successfully',
  });
});
