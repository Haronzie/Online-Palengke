const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const { UnauthenticatedError, UnauthorizedError } = require('../errors');

// Check if user is authenticated
const isAuthenticated = async (req, res, next) => {
  // Check header or cookies for token
  let token;
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    throw new UnauthenticatedError('Authentication invalid');
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from the token
    req.user = await User.findById(decoded.id).select('-password');
    
    if (!req.user) {
      throw new UnauthenticatedError('User not found');
    }
    
    next();
  } catch (error) {
    throw new UnauthenticatedError('Authentication invalid');
  }
};

// Check if user has specific role
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new UnauthorizedError(
        `User role ${req.user.role} is not authorized to access this route`
      );
    }
    next();
  };
};

// Check if user is the owner of the resource or admin
const isResourceOwner = (modelName, paramName = 'id') => {
  return async (req, res, next) => {
    const Model = require(`../models/${modelName}`);
    const resource = await Model.findById(req.params[paramName]);

    if (!resource) {
      throw new NotFoundError(`No resource found with id ${req.params[paramName]}`);
    }

    // Check if user is resource owner or admin
    if (resource.user.toString() !== req.user.id && req.user.role !== 'admin') {
      throw new UnauthorizedError('Not authorized to access this resource');
    }

    next();
  };
};

module.exports = {
  isAuthenticated,
  authorizeRoles,
  isResourceOwner
};
