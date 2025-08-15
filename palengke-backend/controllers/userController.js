const { StatusCodes } = require('http-status-codes');
const User = require('../models/User');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');
const {
  BadRequestError,
  NotFoundError,
  UnauthorizedError
} = require('../errors');
const asyncHandler = require('express-async-handler');

// @desc    Get all users (admin only)
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
  const { role, search, page = 1, limit = 10 } = req.query;
  
  // Build query
  const query = {};
  
  // Filter by role if provided
  if (role) {
    query.role = role;
  }
  
  // Search functionality
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { 'vendorProfile.storeName': { $regex: search, $options: 'i' } }
    ];
  }
  
  // Pagination
  const startIndex = (Number(page) - 1) * Number(limit);
  const endIndex = Number(page) * Number(limit);
  const total = await User.countDocuments(query);
  
  // Get paginated users
  const users = await User.find(query)
    .select('-password')
    .limit(Number(limit))
    .skip(startIndex)
    .sort({ createdAt: -1 });
  
  // Pagination result
  const pagination = {};
  
  if (endIndex < total) {
    pagination.next = {
      page: Number(page) + 1,
      limit: Number(limit)
    };
  }
  
  if (startIndex > 0) {
    pagination.prev = {
      page: Number(page) - 1,
      limit: Number(limit)
    };
  }
  
  res.status(StatusCodes.OK).json({
    success: true,
    count: users.length,
    pagination,
    data: users
  });
});

// @desc    Get single user (admin only)
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id).select('-password');
  
  if (!user) {
    throw new NotFoundError(`No user found with id ${req.params.id}`);
  }
  
  res.status(StatusCodes.OK).json({
    success: true,
    data: user
  });
});

// @desc    Update user (admin only)
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  const { name, email, role, isVerified, isActive } = req.body;
  
  const user = await User.findById(req.params.id);
  
  if (!user) {
    throw new NotFoundError(`No user found with id ${req.params.id}`);
  }
  
  // Update fields
  if (name) user.name = name;
  if (email) user.email = email;
  if (role) user.role = role;
  if (isVerified !== undefined) user.isVerified = isVerified;
  if (isActive !== undefined) user.isActive = isActive;
  
  await user.save();
  
  res.status(StatusCodes.OK).json({
    success: true,
    data: user
  });
});

// @desc    Delete user (admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    throw new NotFoundError(`No user found with id ${req.params.id}`);
  }
  
  // Prevent deleting own account
  if (user._id.toString() === req.user.id) {
    throw new BadRequestError('Cannot delete your own account');
  }
  
  await user.remove();
  
  res.status(StatusCodes.OK).json({
    success: true,
    data: {}
  });
});

// @desc    Update user profile
// @route   PUT /api/users/me
// @access  Private
exports.updateMe = asyncHandler(async (req, res, next) => {
  const { name, email } = req.body;
  const user = await User.findById(req.user.id);

  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Update user fields
  user.name = name || user.name;
  user.email = email || user.email;

  // Handle avatar upload
  if (req.file) {
    // If user already has an avatar, delete the old one from Cloudinary
    if (user.avatar && user.avatar.public_id) {
      await deleteFromCloudinary(user.avatar.public_id);
    }

    // Upload new avatar to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, 'avatars');

    user.avatar = {
      public_id: result.public_id,
      url: result.secure_url,
    };
  }

  const updatedUser = await user.save();

  res.status(StatusCodes.OK).json({
    success: true,
    data: updatedUser,
  });
});

// @desc    Get vendor profile
// @route   GET /api/users/vendor/:id
// @access  Public
exports.getVendorProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({
    _id: req.params.id,
    role: 'vendor'
  }).select('-password');
  
  if (!user) {
    throw new NotFoundError('Vendor not found');
  }
  
  // Get vendor's products count
  const productCount = await Product.countDocuments({ vendor: user._id });
  
  // Get vendor's average rating from products
  const result = await Product.aggregate([
    { $match: { vendor: user._id } },
    { $group: { _id: null, avgRating: { $avg: '$rating' } } }
  ]);
  
  const vendorData = user.toObject();
  vendorData.productCount = productCount;
  vendorData.averageRating = result[0]?.avgRating || 0;
  
  res.status(StatusCodes.OK).json({
    success: true,
    data: vendorData
  });
});

// @desc    Update vendor profile
// @route   PUT /api/users/vendor/update
// @access  Private/Vendor
exports.updateVendorProfile = asyncHandler(async (req, res, next) => {
  const {
    storeName,
    storeDescription,
    phone,
    address,
    returnPolicy,
    businessHours,
    shippingOptions,
    paymentMethods
  } = req.body;
  
  // Find the vendor
  const vendor = await User.findById(req.user.id);
  
  if (!vendor) {
    throw new NotFoundError('Vendor not found');
  }
  
  // Update vendor profile
  vendor.role = 'vendor'; // Ensure role is set to vendor
  vendor.phone = phone || vendor.phone;
  
  // Update or create vendor profile
  vendor.vendorProfile = {
    storeName: storeName || vendor.vendorProfile?.storeName,
    storeDescription: storeDescription || vendor.vendorProfile?.storeDescription,
    returnPolicy: returnPolicy || vendor.vendorProfile?.returnPolicy || {},
    businessHours: businessHours || vendor.vendorProfile?.businessHours || {},
    shippingOptions: shippingOptions || vendor.vendorProfile?.shippingOptions || [],
    paymentMethods: paymentMethods || vendor.vendorProfile?.paymentMethods || [],
    isApproved: vendor.vendorProfile?.isApproved || false
  };
  
  // Update address if provided
  if (address) {
    vendor.address = {
      ...vendor.address,
      ...address
    };
  }
  
  await vendor.save();
  
  res.status(StatusCodes.OK).json({
    success: true,
    data: vendor
  });
});

// @desc    Upload vendor documents
// @route   PUT /api/users/vendor/documents
// @access  Private/Vendor
exports.uploadVendorDocuments = asyncHandler(async (req, res, next) => {
  // This would typically handle file uploads via multer
  // For now, we'll just return a success message
  
  // Example of how you might handle file uploads:
  /*
  if (!req.files || !req.files.businessRegistration) {
    throw new BadRequestError('Please upload all required documents');
  }
  
  const vendor = await User.findById(req.user.id);
  
  // Upload file to cloud storage (e.g., AWS S3, Google Cloud Storage)
  const result = await uploadToCloudinary(req.files.businessRegistration.tempFilePath);
  
  // Save file information to vendor profile
  vendor.vendorProfile.businessRegistration = {
    public_id: result.public_id,
    url: result.secure_url
  };
  
  await vendor.save();
  */
  
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Documents uploaded successfully',
    // data: vendor
  });
});

// @desc    Get current user's orders
// @route   GET /api/users/me/orders
// @access  Private
exports.getMyOrders = asyncHandler(async (req, res, next) => {
  const orders = await Order.find({ user: req.user.id })
    .sort('-createdAt')
    .populate({
      path: 'orderItems.product',
      select: 'name price images'
    });
  
  res.status(StatusCodes.OK).json({
    success: true,
    count: orders.length,
    data: orders
  });
});

// @desc    Get current user's reviews
// @route   GET /api/users/me/reviews
// @access  Private
exports.getMyReviews = asyncHandler(async (req, res, next) => {
  const reviews = await Review.find({ user: req.user.id })
    .populate({
      path: 'product',
      select: 'name images'
    })
    .sort('-createdAt');
  
  res.status(StatusCodes.OK).json({
    success: true,
    count: reviews.length,
    data: reviews
  });
});

// @desc    Update user preferences
// @route   PUT /api/users/me/preferences
// @access  Private
exports.updatePreferences = asyncHandler(async (req, res, next) => {
  const { notifications, theme, language } = req.body;
  
  const user = await User.findById(req.user.id);
  
  if (notifications) {
    user.preferences.notifications = {
      ...user.preferences.notifications,
      ...notifications
    };
  }
  
  if (theme) {
    user.preferences.theme = theme;
  }
  
  if (language) {
    user.preferences.language = language;
  }
  
  await user.save();
  
  res.status(StatusCodes.OK).json({
    success: true,
    data: user.preferences
  });
});

// @desc    Approve/Disapprove Vendor
// @route   PUT /api/users/vendor/:id/approve
// @access  Private/Admin
exports.approveVendor = asyncHandler(async (req, res, next) => {
  const { isApproved } = req.body;

  const vendor = await User.findById(req.params.id);

  if (!vendor) {
    throw new NotFoundError('Vendor not found');
  }

  if (vendor.role !== 'vendor') {
    throw new BadRequestError('User is not a vendor');
  }

  vendor.vendorProfile.isApproved = isApproved;
  await vendor.save();

  res.status(StatusCodes.OK).json({
    success: true,
    data: vendor.vendorProfile.isApproved,
  });
});
