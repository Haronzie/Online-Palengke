const Coupon = require('../models/Coupon');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, NotFoundError, UnauthorizedError } = require('../errors');
const asyncHandler = require('express-async-handler');

// @desc    Create new coupon
// @route   POST /api/coupons
// @access  Private/Admin
exports.createCoupon = asyncHandler(async (req, res) => {
  const { code, discountType, discountValue, minimumOrderAmount, usageLimit, expiresAt } = req.body;

  if (!code || !discountType || !discountValue || !expiresAt) {
    throw new BadRequestError('Please provide all required coupon details');
  }

  const couponExists = await Coupon.findOne({ code });
  if (couponExists) {
    throw new BadRequestError('Coupon with this code already exists');
  }

  const coupon = await Coupon.create({
    code,
    discountType,
    discountValue,
    minimumOrderAmount,
    usageLimit,
    expiresAt,
    createdBy: req.user.id,
  });

  res.status(StatusCodes.CREATED).json({
    success: true,
    data: coupon,
  });
});

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Private/Admin
exports.getAllCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find({});

  res.status(StatusCodes.OK).json({
    success: true,
    count: coupons.length,
    data: coupons,
  });
});

// @desc    Get single coupon by ID
// @route   GET /api/coupons/:id
// @access  Private/Admin
exports.getCouponById = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    throw new NotFoundError(`No coupon found with id ${req.params.id}`);
  }

  res.status(StatusCodes.OK).json({
    success: true,
    data: coupon,
  });
});

// @desc    Validate coupon by code
// @route   GET /api/coupons/validate/:code
// @access  Public
exports.validateCoupon = asyncHandler(async (req, res) => {
  const { code } = req.params;

  const coupon = await Coupon.findOne({ code });

  if (!coupon) {
    throw new NotFoundError('Invalid coupon code');
  }

  if (!coupon.isActive) {
    throw new BadRequestError('Coupon is not active');
  }

  if (coupon.expiresAt < Date.now()) {
    throw new BadRequestError('Coupon has expired');
  }

  if (coupon.usageLimit !== 0 && coupon.usedCount >= coupon.usageLimit) {
    throw new BadRequestError('Coupon usage limit reached');
  }

  res.status(StatusCodes.OK).json({
    success: true,
    data: coupon,
  });
});

// @desc    Delete coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
exports.deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    throw new NotFoundError(`No coupon found with id ${req.params.id}`);
  }

  await coupon.remove();

  res.status(StatusCodes.OK).json({
    success: true,
    data: {},
  });
});
