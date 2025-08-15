const io = require('socket.io-client');

// Create a singleton socket instance
let socketInstance;

const getSocketInstance = () => {
  if (!socketInstance) {
    socketInstance = io(process.env.FRONTEND_URL || 'http://localhost:3000', {
      auth: {
        token: process.env.JWT_SECRET
      }
    });
  }
  return socketInstance;
};

// Emit order update event
const emitOrderUpdate = async (orderId, data) => {
  try {
    const socket = getSocketInstance();
    socket.emit('order-update', {
      orderId,
      ...data
    });
  } catch (error) {
    console.error('Error emitting order update:', error);
  }
};

// Emit product update event
const emitProductUpdate = async (productId, data) => {
  try {
    const socket = getSocketInstance();
    socket.emit('product-update', {
      productId,
      ...data
    });
  } catch (error) {
    console.error('Error emitting product update:', error);
  }
};

module.exports = {
  emitOrderUpdate,
  emitProductUpdate
};
