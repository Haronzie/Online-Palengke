const Product = require('../models/Product');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, NotFoundError, UnauthorizedError } = require('../errors');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');
const { emitProductUpdate } = require('../utils/socketUtils');
const asyncHandler = require('express-async-handler');
const logger = require('../utils/logger');

const LOW_STOCK_THRESHOLD = 10; // Define your low stock threshold here

// @desc    Get all products with filtering, sorting, and pagination
// @route   GET /api/products
// @access  Public
exports.getProducts = asyncHandler(async (req, res) => {
  // Create query object
  const queryObj = { ...req.query };
  const excludedFields = ['page', 'sort', 'limit', 'fields', 'search', 'minPrice', 'maxPrice', 'inStock'];
  excludedFields.forEach(el => delete queryObj[el]);

  // 1) Filtering
  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
  let query = Product.find(JSON.parse(queryStr)).populate('vendor', 'name avatar vendorProfile.storeName');

  // Price Range Filtering
  if (req.query.minPrice || req.query.maxPrice) {
    query = query.find({
      price: {
        ...(req.query.minPrice && { $gte: req.query.minPrice }),
        ...(req.query.maxPrice && { $lte: req.query.maxPrice }),
      },
    });
  }

  // In Stock Filtering
  if (req.query.inStock === 'true') {
    query = query.find({ stock: { $gt: 0 } });
  } else if (req.query.inStock === 'false') {
    query = query.find({ stock: 0 });
  }

  // 2) Search
  if (req.query.search) {
    const search = req.query.search;
    query = query.find({
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'specifications.value': { $regex: search, $options: 'i' } }
      ]
    });
  }

  // 3) Sorting
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  // 4) Field limiting
  if (req.query.fields) {
    const fields = req.query.fields.split(',').join(' ');
    query = query.select(fields);
  } else {
    query = query.select('-__v');
  }

  // 5) Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;
  const endIndex = page * limit;
  
  const total = await Product.countDocuments(query);
  
  query = query.skip(skip).limit(limit);

  // Execute query
  const products = await query;

  // Pagination result
  const pagination = {};
  
  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }
  
  if (skip > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  res.status(StatusCodes.OK).json({
    success: true,
    count: products.length,
    pagination,
    data: products
  });
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('vendor', 'name avatar vendorProfile.storeName')
    .populate({
      path: 'reviews',
      populate: {
        path: 'user',
        select: 'name avatar'
      }
    });

  if (!product) {
    throw new NotFoundError(`No product found with id ${req.params.id}`);
  }

  res.status(StatusCodes.OK).json({
    success: true,
    data: product
  });
});

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Vendor
exports.createProduct = asyncHandler(async (req, res) => {
  // Add vendor to req.body
  req.body.vendor = req.user.id;
  
  const product = await Product.create({
    ...req.body,
    vendor: req.user.id
  });

  // Emit product creation event
  await emitProductUpdate(product._id, {
    name: product.name,
    price: product.price,
    stock: product.stock,
    createdAt: product.createdAt
  });

  res.status(StatusCodes.CREATED).json({
    success: true,
    data: product
  });
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Vendor & Admin
exports.updateProduct = asyncHandler(async (req, res) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    throw new NotFoundError(`No product found with id ${req.params.id}`);
  }

  // Make sure user is product owner or admin
  if (product.vendor.toString() !== req.user.id && req.user.role !== 'admin') {
    throw new UnauthorizedError('Not authorized to update this product');
  }

  // For file uploads, you would handle the file upload first and then update the product
  // This is a simplified version
  product = await Product.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true, runValidators: true }
  );

  // Emit product update event
  await emitProductUpdate(product._id, {
    name: product.name,
    price: product.price,
    stock: product.stock,
    updatedAt: product.updatedAt
  });

  res.status(StatusCodes.OK).json({
    success: true,
    data: product
  });
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Vendor & Admin
exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new NotFoundError(`No product found with id ${req.params.id}`);
  }

  // Make sure user is product owner or admin
  if (product.vendor.toString() !== req.user.id && req.user.role !== 'admin') {
    throw new UnauthorizedError('Not authorized to delete this product');
  }

  // Delete product images from cloud storage if they exist
  if (product.images && product.images.length > 0) {
    for (const image of product.images) {
      await deleteFromCloudinary(image.public_id);
    }
  }

  await product.remove();

  // Emit product deletion event
  await emitProductUpdate(req.params.id, {
    status: 'deleted',
    deletedAt: Date.now()
  });

  res.status(StatusCodes.OK).json({
    success: true,
    data: {}
  });
});

// @desc    Upload product images
// @route   PUT /api/products/:id/images
// @access  Private/Vendor
exports.uploadProductImages = asyncHandler(async (req, res) => {
  // This would be handled by the upload middleware
  // The actual file upload would be handled by multer and cloudinary
  
  if (!req.files || req.files.length === 0) {
    throw new BadRequestError('Please upload at least one image');
  }

  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new NotFoundError(`No product found with id ${req.params.id}`);
  }

  // Make sure user is product owner or admin
  if (product.vendor.toString() !== req.user.id && req.user.role !== 'admin') {
    throw new UnauthorizedError('Not authorized to update this product');
  }

  // Upload images to cloudinary
  const uploadPromises = req.files.map(file => uploadToCloudinary(file.path, 'products'));
  const uploadResults = await Promise.all(uploadPromises);

  // Add new images to product
  const newImages = uploadResults.map(result => ({
    public_id: result.public_id,
    url: result.secure_url
  }));

  // Add new images to existing ones
  product.images = [...(product.images || []), ...newImages];
  await product.save();

  res.status(StatusCodes.OK).json({
    success: true,
    data: product.images
  });
});

// @desc    Delete product image
// @route   DELETE /api/products/:id/images/:imageId
// @access  Private/Vendor
exports.deleteProductImage = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new NotFoundError(`No product found with id ${req.params.id}`);
  }

  // Make sure user is product owner or admin
  if (product.vendor.toString() !== req.user.id && req.user.role !== 'admin') {
    throw new UnauthorizedError('Not authorized to update this product');
  }

  // Find the image to delete
  const imageIndex = product.images.findIndex(
    img => img._id.toString() === req.params.imageId
  );

  if (imageIndex === -1) {
    throw new NotFoundError(`No image found with id ${req.params.imageId}`);
  }

  // Delete image from cloudinary
  await deleteFromCloudinary(product.images[imageIndex].public_id);

  // Remove image from product
  product.images.splice(imageIndex, 1);
  await product.save();

  res.status(StatusCodes.OK).json({
    success: true,
    data: product.images
  });
});

// @desc    Get top rated products
// @route   GET /api/products/top
// @access  Public
exports.getTopProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({})
    .sort({ rating: -1 })
    .limit(5)
    .populate('vendor', 'name avatar vendorProfile.storeName');

  res.status(StatusCodes.OK).json({
    success: true,
    count: products.length,
    data: products
  });
});

// @desc    Update product stock
// @route   PUT /api/products/:id/stock
// @access  Private/Vendor
exports.updateProductStock = asyncHandler(async (req, res) => {
  const { quantity, operation = 'add' } = req.body;
  
  if (!quantity || isNaN(quantity)) {
    throw new BadRequestError('Please provide a valid quantity');
  }

  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new NotFoundError(`No product found with id ${req.params.id}`);
  }

  // Make sure user is product owner or admin
  if (product.vendor.toString() !== req.user.id && req.user.role !== 'admin') {
    throw new UnauthorizedError('Not authorized to update this product');
  }

  // Update stock based on operation
  if (operation === 'add') {
    product.stock += Number(quantity);
  } else if (operation === 'subtract') {
    if (product.stock < quantity) {
      throw new BadRequestError('Insufficient stock');
    }
    product.stock -= Number(quantity);
  } else if (operation === 'set') {
    product.stock = Number(quantity);
  } else {
    throw new BadRequestError('Invalid operation. Use add, subtract, or set');
  }

  // Emit stock update event
  await emitProductUpdate(product._id, {
    stock: product.stock,
    updatedAt: Date.now()
  });

  // Low stock alert
  if (product.stock <= LOW_STOCK_THRESHOLD) {
    logger.warn(`Low stock alert for product ${product.name} (ID: ${product._id}). Current stock: ${product.stock}`);
    // In a real application, you might send an email to the vendor or admin here
  }
});

// @desc    Get all products (admin only)
// @route   GET /api/products/admin/all
// @access  Private/Admin
exports.adminGetAllProducts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search } = req.query;

  const query = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const startIndex = (Number(page) - 1) * Number(limit);
  const total = await Product.countDocuments(query);

  const products = await Product.find(query)
    .populate('vendor', 'name')
    .limit(Number(limit))
    .skip(startIndex)
    .sort({ createdAt: -1 });

  const pagination = {};
  if ((startIndex + products.length) < total) {
    pagination.next = {
      page: Number(page) + 1,
      limit: Number(limit),
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: Number(page) - 1,
      limit: Number(limit),
    };
  }

  res.status(StatusCodes.OK).json({
    success: true,
    count: products.length,
    total,
    pagination,
    data: products,
  });
});