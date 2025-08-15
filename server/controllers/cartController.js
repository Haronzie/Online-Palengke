const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, NotFoundError } = require('../errors');
const asyncHandler = require('express-async-handler');

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
exports.getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.id }).populate('items.product', 'name price images stock');

  if (!cart) {
    return res.status(StatusCodes.OK).json({
      success: true,
      data: { items: [] }, // Return an empty cart if not found
    });
  }

  res.status(StatusCodes.OK).json({
    success: true,
    data: cart,
  });
});

// @desc    Add item to cart or update quantity
// @route   POST /api/cart
// @access  Private
exports.addItemToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;

  if (!productId || !quantity || quantity <= 0) {
    throw new BadRequestError('Please provide a valid product ID and quantity');
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw new NotFoundError('Product not found');
  }

  if (product.stock < quantity) {
    throw new BadRequestError(`Not enough stock for ${product.name}. Available: ${product.stock}`);
  }

  let cart = await Cart.findOne({ user: req.user.id });

  if (!cart) {
    // Create new cart if it doesn't exist
    cart = await Cart.create({
      user: req.user.id,
      items: [],
    });
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId
  );

  if (itemIndex > -1) {
    // Update quantity if item already in cart
    const currentQuantity = cart.items[itemIndex].quantity;
    const newQuantity = currentQuantity + quantity;

    if (product.stock < newQuantity) {
      throw new BadRequestError(`Cannot add ${quantity} more of ${product.name}. Only ${product.stock - currentQuantity} available.`);
    }
    cart.items[itemIndex].quantity = newQuantity;
  } else {
    // Add new item to cart
    cart.items.push({
      product: productId,
      name: product.name,
      image: product.images[0]?.url || '',
      price: product.price,
      quantity,
      vendor: product.vendor,
    });
  }

  await cart.save();
  res.status(StatusCodes.OK).json({
    success: true,
    data: cart,
  });
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
// @access  Private
exports.removeItemFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    throw new NotFoundError('Cart not found');
  }

  cart.items = cart.items.filter(
    (item) => item.product.toString() !== productId
  );

  await cart.save();
  res.status(StatusCodes.OK).json({
    success: true,
    data: cart,
  });
});

// @desc    Update item quantity in cart
// @route   PUT /api/cart/:productId
// @access  Private
exports.updateCartItemQuantity = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity <= 0) {
    throw new BadRequestError('Quantity must be a positive number');
  }

  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    throw new NotFoundError('Cart not found');
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId
  );

  if (itemIndex === -1) {
    throw new NotFoundError('Product not found in cart');
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw new NotFoundError('Product not found');
  }

  if (product.stock < quantity) {
    throw new BadRequestError(`Not enough stock for ${product.name}. Available: ${product.stock}`);
  }

  cart.items[itemIndex].quantity = quantity;
  await cart.save();

  res.status(StatusCodes.OK).json({
    success: true,
    data: cart,
  });
});

// @desc    Clear user cart
// @route   DELETE /api/cart
// @access  Private
exports.clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    throw new NotFoundError('Cart not found');
  }

  cart.items = [];
  await cart.save();

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Cart cleared successfully',
  });
});
