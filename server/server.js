const mongoose = require('mongoose');
const http = require('http');
const app = require('./app');
const logger = require('./utils/logger'); // Use the new logger
const socketConfig = require('./config/socket');
const validateEnv = require('./config/envValidation'); // Import env validation

// Load environment variables
require('dotenv').config({ path: './.env' });

// Validate environment variables
validateEnv();

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  logger.error(err.name, err.message, err.stack);
  process.exit(1);
});

// Connect to MongoDB
const DB = process.env.MONGO_URI.replace(
  '<PASSWORD>',
  process.env.MONGO_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // useCreateIndex: true, // Deprecated in newer Mongoose versions
    // useFindAndModify: false // Deprecated in newer Mongoose versions
  })
  .then(() => {
    logger.info('DB connection successful!');
  })
  .catch((err) => {
    logger.error('DB connection error:', err.message, err.stack);
    process.exit(1);
  });

// Create HTTP server
const port = process.env.PORT || 5000;
const httpServer = http.createServer(app);

// Initialize Socket.IO
const io = socketConfig(httpServer);

// Start server
const server = httpServer.listen(port, () => {
  logger.info(`App running on port ${port}...`);
  logger.info(`Server started on port ${port} in ${process.env.NODE_ENV} mode`);
  logger.info('Socket.IO server initialized');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
  logger.error(err.name, err.message, err.stack);
  
  server.close(() => {
    process.exit(1);
  });
});

// Handle SIGTERM (for Heroku)
process.on('SIGTERM', () => {
  logger.info('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    logger.info('💥 Process terminated!');
  });
});

module.exports = server;