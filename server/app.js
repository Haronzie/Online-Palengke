const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const morgan = require('morgan');
const compression = require('compression');
const { StatusCodes } = require('http-status-codes');
const { NotFoundError } = require('./errors');
const logger = require('./utils/logger'); // Import the logger
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const cartRoutes = require('./routes/cartRoutes'); // Import cart routes
const wishlistRoutes = require('./routes/wishlistRoutes'); // Import wishlist routes
const reviewRoutes = require('./routes/reviewRoutes'); // Import review routes
const couponRoutes = require('./routes/couponRoutes'); // Import coupon routes

// Initialize express app
const app = express();

// 1) GLOBAL MIDDLEWARES

// Set security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same API
const limiter = rateLimit({
  max: 100, // 100 requests per windowMs
  windowMs: 15 * 60 * 1000, // 15 minutes
  message: 'Too many requests from this IP, please try again in 15 minutes!'
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'price',
      'rating',
      'stock',
      'sold',
      'isFeatured',
      'isNew',
      'deliveryTime'
    ]
  })
);

// Enable CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Compress responses
app.use(compression());

// 2) ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes); // Use cart routes
app.use('/api/wishlist', wishlistRoutes); // Use wishlist routes
app.use('/api/reviews', reviewRoutes); // Use review routes
app.use('/api/coupons', couponRoutes); // Use coupon routes

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Server is healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Swagger API documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 3) STATIC FILES
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 4) ERROR HANDLING
// Handle 404 - Not Found
app.all('*', (req, res, next) => {
  next(new NotFoundError(`Can't find ${req.originalUrl} on this server!`));
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error(err.stack); // Use logger instead of console.error
  
  // Handle validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      error: 'Validation Error',
      message: messages.join('. '),
      stack: process.env.NODE_ENV === 'development' ? err.stack : {}
    });
  }
  
  // Handle duplicate key errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Duplicate field value: ${err.keyValue[field]}. Please use another value!`;
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      error: 'Duplicate Field Error',
      message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : {}
    });
  }
  
  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      success: false,
      error: 'Invalid token. Please log in again!',
      stack: {}
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      success: false,
      error: 'Your token has expired! Please log in again.',
      stack: {}
    });
  }
  
  // Default error handling
  const statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  const message = err.message || 'Something went wrong!';
  
  res.status(statusCode).json({
    success: false,
    error: message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : {}
  });
});

module.exports = app;