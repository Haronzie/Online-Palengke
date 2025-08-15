const mongoose = require('mongoose');
require('dotenv').config();

const http = require('http');
const app = require('./app');
const socketConfig = require('./config/socket');

// Create the HTTP server from the Express app
const server = http.createServer(app);

// Attach Socket.IO to the server
const io = socketConfig(server);

// Make the io instance available to all routes
app.set('io', io);

// Connect to MongoDB and start server
const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });
