const mongoose = require('mongoose');

const orderStatusSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    index: true
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']
  },
  changedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reason: String,
  comment: String,
  metadata: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
});

// Index for faster querying
orderStatusSchema.index({ order: 1, createdAt: -1 });

// Pre-save hook to add metadata
orderStatusSchema.pre('save', function(next) {
  if (!this.metadata) {
    this.metadata = new Map();
  }
  this.metadata.set('ip', this.metadata.get('ip') || '0.0.0.0');
  this.metadata.set('userAgent', this.metadata.get('userAgent') || 'unknown');
  next();
});

// Static method to get status history for an order
orderStatusSchema.statics.getStatusHistory = async function(orderId) {
  return this.find({ order: orderId })
    .sort({ createdAt: -1 })
    .populate('changedBy', 'name email')
    .lean();
};

// Static method to get current status of an order
orderStatusSchema.statics.getCurrentStatus = async function(orderId) {
  const status = await this.findOne({ order: orderId })
    .sort({ createdAt: -1 })
    .limit(1)
    .lean();
  
  return status ? status.status : null;
};

// Method to format status for display
orderStatusSchema.methods.toDisplayFormat = function() {
  const statusMap = {
    'pending': 'Pending',
    'processing': 'Processing',
    'shipped': 'Shipped',
    'delivered': 'Delivered',
    'cancelled': 'Cancelled',
    'refunded': 'Refunded'
  };

  return {
    status: statusMap[this.status] || this.status,
    changedAt: this.createdAt,
    changedBy: this.changedBy,
    reason: this.reason,
    comment: this.comment
  };
};

module.exports = mongoose.model('OrderStatus', orderStatusSchema);
