const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product is required'],
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: [true, 'Order reference is required']
  },
  rating: {
    type: Number,
    required: [true, 'Please add a rating between 1 and 5'],
    min: 1,
    max: 5
  },
  title: {
    type: String,
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters'],
    required: [true, 'Please add a title for the review']
  },
  comment: {
    type: String,
    required: [true, 'Please add a comment'],
    maxlength: [1000, 'Comment cannot be more than 1000 characters']
  },
  images: [{
    public_id: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    }
  }],
  isApproved: {
    type: Boolean,
    default: false
  },
  helpful: {
    count: {
      type: Number,
      default: 0
    },
    users: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  vendorResponse: {
    comment: String,
    date: Date
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    deviceType: {
      type: String,
      enum: ['desktop', 'mobile', 'tablet', 'other']
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Prevent user from submitting more than one review per product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Static method to get average rating of a product
reviewSchema.statics.getAverageRating = async function(productId) {
  const obj = await this.aggregate([
    {
      $match: { product: productId, isApproved: true }
    },
    {
      $group: {
        _id: '$product',
        averageRating: { $avg: '$rating' },
        numOfReviews: { $sum: 1 }
      }
    }
  ]);

  try {
    await this.model('Product').findByIdAndUpdate(productId, {
      rating: obj[0] ? obj[0].averageRating : 0,
      numOfReviews: obj[0] ? obj[0].numOfReviews : 0
    });
  } catch (err) {
    console.error('Error updating product rating:', err);
  }
};

// Call getAverageRating after save
reviewSchema.post('save', function() {
  this.constructor.getAverageRating(this.product);
});

// Call getAverageRating after remove
reviewSchema.post('remove', function() {
  this.constructor.getAverageRating(this.product);
});

// Method to check if a user has already marked the review as helpful
reviewSchema.methods.isHelpfulForUser = function(userId) {
  return this.helpful.users.some(id => id.toString() === userId.toString());
};

// Method to add a helpful vote
reviewSchema.methods.addHelpfulVote = async function(userId) {
  if (this.isHelpfulForUser(userId)) {
    throw new Error('You have already marked this review as helpful');
  }
  
  this.helpful.count += 1;
  this.helpful.users.push(userId);
  await this.save();
  
  return this;
};

// Method to remove a helpful vote
reviewSchema.methods.removeHelpfulVote = async function(userId) {
  if (!this.isHelpfulForUser(userId)) {
    throw new Error('You have not marked this review as helpful');
  }
  
  this.helpful.count = Math.max(0, this.helpful.count - 1);
  this.helpful.users = this.helpful.users.filter(
    id => id.toString() !== userId.toString()
  );
  
  await this.save();
  return this;
};

module.exports = mongoose.model('Review', reviewSchema);
