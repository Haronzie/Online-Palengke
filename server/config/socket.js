const socketIO = require('socket.io');
const { Server } = require('socket.io');
const { StatusCodes } = require('http-status-codes');
const { UnauthorizedError } = require('../errors');

const socketConfig = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST']
    },
    maxHttpBufferSize: 1e6, // 1MB
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new UnauthorizedError('Authentication token required'));
    }

    // Verify token (you'll need to implement this based on your auth system)
    try {
      // This is a placeholder - replace with your actual token verification
      // const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // socket.user = decoded.userId;
      next();
    } catch (error) {
      next(new UnauthorizedError('Invalid authentication token'));
    }
  });

  // Order tracking
  io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('join-order', async (orderId) => {
      try {
        // Verify user has access to this order
        const order = await Order.findById(orderId);
        if (!order) {
          throw new Error('Order not found');
        }

        // Only allow user or vendor to join
        if (order.user.toString() !== socket.user &&
            !order.orderItems.some(item => item.vendor?.toString() === socket.user)) {
          throw new Error('Not authorized to track this order');
        }

        socket.join(`order-${orderId}`);
        console.log(`Client joined order-${orderId}`);

        // Send initial order status
        io.to(`order-${orderId}`).emit('order-update', {
          orderId,
          status: order.orderStatus,
          updatedAt: order.updatedAt
        });

      } catch (error) {
        socket.emit('error', {
          code: StatusCodes.FORBIDDEN,
          message: error.message
        });
      }
    });

    socket.on('join-product', async (productId) => {
      try {
        const product = await Product.findById(productId);
        if (!product) {
          throw new Error('Product not found');
        }

        socket.join(`product-${productId}`);
        console.log(`Client joined product-${productId}`);

        // Send initial product data
        io.to(`product-${productId}`).emit('product-update', {
          productId,
          stock: product.stock,
          price: product.price,
          updatedAt: product.updatedAt
        });

      } catch (error) {
        socket.emit('error', {
          code: StatusCodes.FORBIDDEN,
          message: error.message
        });
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });

  return io;
};

module.exports = socketConfig;
