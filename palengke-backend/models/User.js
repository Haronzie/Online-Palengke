const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter your name'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please enter your email'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Please enter a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  avatar: {
    public_id: String,
    url: String
  },
  role: {
    type: String,
    enum: ['user', 'vendor', 'admin'],
    default: 'user'
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[0-9\-\+\s]+$/, 'Please enter a valid phone number']
  },
  address: {
    street: String,
    city: String,
    province: String,
    postalCode: String,
    country: {
      type: String,
      default: 'Philippines'
    },
    coordinates: {
      // GeoJSON Point
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        default: [0, 0]
      },
      formattedAddress: String
    }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  emailVerificationToken: String,
  emailVerificationExpire: Date,
  lastLogin: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  preferences: {
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      },
      push: {
        type: Boolean,
        default: true
      }
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'light'
    },
    language: {
      type: String,
      default: 'en',
      enum: ['en', 'fil', 'ceb'] // English, Filipino, Cebuano
    }
  },
  socialLinks: {
    facebook: String,
    twitter: String,
    instagram: String,
    tiktok: String
  },
  vendorProfile: {
    storeName: String,
    storeDescription: String,
    storeLogo: {
      public_id: String,
      url: String
    },
    banner: {
      public_id: String,
      url: String
    },
    businessRegistration: {
      type: String, // Path to business registration document
      select: false
    },
    isApproved: {
      type: Boolean,
      default: false
    },
    rating: {
      type: Number,
      default: 0
    },
    totalSales: {
      type: Number,
      default: 0
    },
    responseRate: {
      type: Number,
      default: 0
    },
    responseTime: String,
    shippingOptions: [{
      name: String,
      price: Number,
      estimatedDelivery: String,
      isFree: Boolean
    }],
    returnPolicy: {
      acceptsReturns: Boolean,
      returnWithinDays: Number,
      refundPolicy: String,
      returnShippingPaidBy: {
        type: String,
        enum: ['buyer', 'seller']
      }
    },
    businessHours: {
      monday: { open: String, close: String },
      tuesday: { open: String, close: String },
      wednesday: { open: String, close: String },
      thursday: { open: String, close: String },
      friday: { open: String, close: String },
      saturday: { open: String, close: String },
      sunday: { open: String, close: String }
    },
    paymentMethods: [{
      type: String,
      enum: ['cod', 'bank-transfer', 'gcash', 'maya', 'credit-card', 'paypal']
    }]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Encrypt password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Sign JWT and return
userSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password reset token
userSchema.methods.getResetPasswordToken = function() {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire (10 minutes)
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// Virtual for user's full address
userSchema.virtual('fullAddress').get(function() {
  return `${this.address.street}, ${this.address.city}, ${this.address.province}, ${this.address.postalCode}, ${this.address.country}`;
});

// Index for text search
userSchema.index({ 
  name: 'text', 
  email: 'text',
  'vendorProfile.storeName': 'text'
});

// Cascade delete products when a vendor is deleted
userSchema.pre('remove', async function(next) {
  if (this.role === 'vendor') {
    await this.model('Product').deleteMany({ vendor: this._id });
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
