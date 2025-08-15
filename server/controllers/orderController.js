const { StatusCodes } = require('http-status-codes');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { emitOrderUpdate, emitProductUpdate } = require('../utils/socketUtils');
const {
  BadRequestError,
  NotFoundError,
  UnauthorizedError
} = require('../errors');
const asyncHandler = require('express-async-handler');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = asyncHandler(async (req, res) => {
  const {
    orderItems,
    shippingInfo,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    notes
  } = req.body;

  if (!orderItems || orderItems.length === 0) {
    throw new BadRequestError('No order items provided');
  }

  // Verify products and calculate prices
  let orderItemsWithPrices = [];
  let calculatedItemsPrice = 0;
  
  for (const item of orderItems) {
    const product = await Product.findById(item.product);
    
    if (!product) {
      throw new NotFoundError(`Product not found with id: ${item.product}`);
    }
    
    if (product.stock < item.quantity) {
      throw new BadRequestError(`Not enough stock for product: ${product.name}`);
    }
    
    const itemTotal = product.price * item.quantity;
    calculatedItemsPrice += itemTotal;
    
    orderItemsWithPrices.push({
      product: product._id,
      name: product.name,
      image: product.images[0]?.url || '',
      price: product.price,
      quantity: item.quantity,
      totalPrice: itemTotal,
      vendor: product.vendor
    });
  }
  
  // Verify calculated prices match provided prices
  // Note: In production, you might want to handle this more strictly
  const calculatedTotalPrice = calculatedItemsPrice + taxPrice + shippingPrice;
  
  if (Math.abs(calculatedTotalPrice - totalPrice) > 0.01) {
    throw new BadRequestError('Price mismatch. Please refresh and try again.');
  }
  
  // Create order
  const order = await Order.create({
    orderItems: orderItemsWithPrices,
    user: req.user.id,
    shippingInfo,
    paymentInfo: {
      paymentMethod,
      status: paymentMethod === 'cod' ? 'pending' : 'completed',
      amount: totalPrice
    },
    itemsPrice: calculatedItemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice: calculatedTotalPrice,
    notes
  });

  // Emit order creation event
  await emitOrderUpdate(order._id, {
    status: order.orderStatus,
    createdAt: order.createdAt
  });

  // Update product stock
  for (const item of orderItems) {
    await Product.updateOne(
      { _id: item.product },
      { $inc: { stock: -item.quantity, sold: item.quantity } }
    );
    
    // Emit product stock update event
    await emitProductUpdate(item.product, {
      stock: item.stock,
      updatedAt: Date.now()
    });
  }
  
  await order.save();

  res.status(StatusCodes.CREATED).json({
    success: true,
    data: order
  });
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email')
    .populate({
      path: 'orderItems.product',
      select: 'name images'
    })
    .populate({
      path: 'orderItems.vendor',
      select: 'name avatar vendorProfile.storeName'
    });

  if (!order) {
    throw new NotFoundError(`No order found with id ${req.params.id}`);
  }
  
  // Check if user is authorized to view this order
  if (order.user._id.toString() !== req.user.id && 
      req.user.role !== 'admin' && 
      !order.orderItems.some(item => item.vendor?._id?.toString() === req.user.id)) {
    throw new UnauthorizedError('Not authorized to view this order');
  }

  res.status(StatusCodes.OK).json({
    success: true,
    data: order
  });
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin/Vendor
exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  
  if (!status) {
    throw new BadRequestError('Please provide a status');
  }
  
  const order = await Order.findById(req.params.id);
  
  if (!order) {
    throw new NotFoundError(`No order found with id ${req.params.id}`);
  }
  
  // Check if user is authorized to update this order
  const isVendor = req.user.role === 'vendor';
  const isAdmin = req.user.role === 'admin';
  
  if (isVendor) {
    // Vendor can only update status of their own products
    const vendorOrderItems = order.orderItems.filter(
      item => item.vendor?.toString() === req.user.id
    );
    
    if (vendorOrderItems.length === 0) {
      throw new UnauthorizedError('Not authorized to update this order');
    }
    
    // Update only the vendor's items
    order.orderItems = order.orderItems.map(item => {
      if (item.vendor?.toString() === req.user.id) {
        item.status = status;
      }
      return item;
    });
    
    // Update overall order status if all items are delivered
    const allDelivered = order.orderItems.every(item => item.status === 'delivered');
    if (allDelivered) {
      order.orderStatus = 'delivered';
      order.deliveredAt = Date.now();
    }
  } else if (isAdmin) {
    // Admin can update the entire order
    order.orderStatus = status;
    
    if (status === 'delivered') {
      order.deliveredAt = Date.now();
    }
    
    // Update all items status
    order.orderItems = order.orderItems.map(item => ({
      ...item,
      status
    }));
  } else {
    throw new UnauthorizedError('Not authorized to update this order');
  }
  
  await order.save();
  
  // TODO: Send email notification to customer about status update
  
  res.status(StatusCodes.OK).json({
    success: true,
    data: order
  });
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
exports.getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user.id })
    .sort('-createdAt')
    .populate({
      path: 'orderItems.product',
      select: 'name images'
    });
    
  res.status(StatusCodes.OK).json({
    success: true,
    count: orders.length,
    data: orders
  });
});

// @desc    Get all orders (admin/vendor)
// @route   GET /api/orders
// @access  Private/Admin/Vendor
exports.getAllOrders = asyncHandler(async (req, res) => {
  let query = {};
  
  // If vendor, only show orders containing their products
  if (req.user.role === 'vendor') {
    query = { 'orderItems.vendor': req.user.id };
  }
  
  const orders = await Order.find(query)
    .populate('user', 'name email')
    .populate({
      path: 'orderItems.product',
      select: 'name images'
    })
    .populate({
      path: 'orderItems.vendor',
      select: 'name'
    })
    .sort('-createdAt');
    
  res.status(StatusCodes.OK).json({
    success: true,
    count: orders.length,
    data: orders
  });
});

// @desc    Get sales statistics (admin/vendor)
// @route   GET /api/orders/sales
// @access  Private/Admin/Vendor
exports.getSalesStats = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  
  let matchStage = {};
  
  // Filter by date range if provided
  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = new Date(startDate);
    if (endDate) matchStage.createdAt.$lte = new Date(endDate);
  }
  
  // Filter by vendor if user is a vendor
  if (req.user.role === 'vendor') {
    matchStage['orderItems.vendor'] = req.user.id;
  }
  
  const stats = await Order.aggregate([
    { $match: matchStage },
    { $unwind: '$orderItems' },
    {
      $group: {
        _id: null,
        totalSales: { $sum: '$orderItems.totalPrice' },
        totalOrders: { $sum: 1 },
        totalItems: { $sum: '$orderItems.quantity' },
        productsSold: { $addToSet: '$orderItems.product' }
      }
    },
    {
      $project: {
        _id: 0,
        totalSales: 1,
        totalOrders: 1,
        totalItems: 1,
        totalProducts: { $size: '$productsSold' }
      }
    }
  ]);
  
  res.status(StatusCodes.OK).json({
    success: true,
    data: stats[0] || {
      totalSales: 0,
      totalOrders: 0,
      totalItems: 0,
      totalProducts: 0
    }
  });
});

// @desc    Process payment (stripe/webhook)
// @route   POST /api/orders/:id/pay
// @access  Private
exports.processPayment = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  
  if (!order) {
    throw new NotFoundError(`No order found with id ${req.params.id}`);
  }
  
  // Verify order belongs to user
  if (order.user.toString() !== req.user.id) {
    throw new UnauthorizedError('Not authorized to pay for this order');
  }
  
  // In a real app, you would integrate with a payment processor here
  // This is a simplified version
  
  // Update order to paid
  order.paymentInfo.status = 'completed';
  order.paymentInfo.paidAt = Date.now();
  order.paymentInfo.paymentId = `mock_payment_${Date.now()}`;

  // Emit payment update event
  await emitOrderUpdate(order._id, {
    paymentStatus: 'completed',
    paidAt: order.paymentInfo.paidAt
  });
  
  await order.save();
  
  res.status(StatusCodes.OK).json({
    success: true,
    data: order
  });
});