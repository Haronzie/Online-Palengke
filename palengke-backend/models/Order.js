const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity cannot be less than 1']
  },
  totalPrice: {
    type: Number,
    required: true
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded', 'returned'],
    default: 'pending'
  },
  deliveredAt: Date,
  cancellationReason: String
});

const shippingInfoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter recipient name']
  },
  phone: {
    type: String,
    required: [true, 'Please enter phone number']
  },
  address: {
    street: {
      type: String,
      required: [true, 'Please enter street address']
    },
    city: {
      type: String,
      required: [true, 'Please enter city']
    },
    province: {
      type: String,
      required: [true, 'Please enter province']
    },
    postalCode: {
      type: String,
      required: [true, 'Please enter postal code']
    },
    country: {
      type: String,
      default: 'Philippines'
    },
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        required: true
      },
      formattedAddress: String,
      zipcode: String,
      city: String,
      state: String,
      country: String
    }
  },
  notes: String
});

const paymentInfoSchema = new mongoose.Schema({
  id: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    required: [true, 'Please select payment method'],
    enum: ['cod', 'gcash', 'maya', 'bank-transfer', 'credit-card']
  },
  paymentDate: {
    type: Date
  },
  amount: {
    type: Number,
    required: true
  },
  receiptUrl: String,
  referenceNumber: String
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderItems: [orderItemSchema],
  shippingInfo: shippingInfoSchema,
  paymentInfo: paymentInfoSchema,
  itemsPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  taxPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  shippingPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  orderStatus: {
    type: String,
    required: true,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded', 'returned'],
    default: 'pending'
  },
  deliveredAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  cancellationReason: String,
  notes: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Generate order number before saving
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const count = await this.constructor.countDocuments();
    this.orderNumber = `ORD-${Date.now()}-${count + 1}`;
  }
  next();
});

// Calculate total price before saving
orderSchema.pre('save', function(next) {
  // Calculate items price
  this.itemsPrice = this.orderItems.reduce((acc, item) => {
    return acc + (item.price * item.quantity);
  }, 0);
  
  // Calculate total price (items + shipping + tax)
  this.totalPrice = this.itemsPrice + this.shippingPrice + this.taxPrice;
  
  next();
});

// Virtual for order status history
orderSchema.virtual('statusHistory', {
  ref: 'OrderStatus',
  localField: '_id',
  foreignField: 'order',
  justOne: false
});

// Static method to get monthly sales
orderSchema.statics.getMonthlySales = async function() {
  const currentDate = new Date();
  const lastYear = new Date(currentDate.setFullYear(currentDate.getFullYear() - 1));

  const data = await this.aggregate([
    {
      $match: {
        createdAt: { $gte: lastYear },
        orderStatus: 'delivered'
      }
    },
    {
      $project: {
        month: { $month: '$createdAt' },
        sales: '$totalPrice'
      }
    },
    {
      $group: {
        _id: '$month',
        total: { $sum: '$sales' }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  return data;
};

module.exports = mongoose.model('Order', orderSchema);