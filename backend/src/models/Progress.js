const mongoose = require('mongoose');

/**
 * Progress Schema
 * Tracks user progress on courses and books
 */
const progressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: false,
    validate: {
      validator: function() {
        // Either courseId or bookId must be provided
        return this.courseId || this.bookId;
      },
      message: 'Either courseId or bookId must be provided'
    }
  },
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: false,
    validate: {
      validator: function() {
        // Either courseId or bookId must be provided
        return this.courseId || this.bookId;
      },
      message: 'Either courseId or bookId must be provided'
    }
  },
  completionPercentage: {
    type: Number,
    required: true,
    min: [0, 'Completion percentage cannot be less than 0'],
    max: [100, 'Completion percentage cannot exceed 100'],
    default: 0
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date,
    validate: {
      validator: function(v) {
        // completedAt should only be set when progress is 100%
        if (v && this.completionPercentage < 100) {
          return false;
        }
        return true;
      },
      message: 'Completed date can only be set when progress is 100%'
    }
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [2000, 'Notes cannot exceed 2000 characters']
  },
  // Additional tracking fields
  timeSpent: {
    type: Number, // in minutes
    min: [0, 'Time spent cannot be negative'],
    default: 0
  },
  currentChapter: {
    type: String,
    trim: true,
    maxlength: [200, 'Current chapter cannot exceed 200 characters']
  },
  lastCheckpoint: {
    type: String,
    trim: true,
    maxlength: [100, 'Last checkpoint cannot exceed 100 characters']
  },
  rating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  difficulty: {
    type: String,
    enum: ['too_easy', 'just_right', 'too_hard'],
    default: 'just_right'
  }
}, {
  timestamps: true
});

/**
 * Compound indexes for better query performance
 */
progressSchema.index({ userId: 1, courseId: 1 }, { unique: true, sparse: true });
progressSchema.index({ userId: 1, bookId: 1 }, { unique: true, sparse: true });
progressSchema.index({ userId: 1, lastAccessedAt: -1 });
progressSchema.index({ completionPercentage: 1 });
progressSchema.index({ completedAt: 1 });

/**
 * Virtual for progress type
 */
progressSchema.virtual('type').get(function() {
  return this.courseId ? 'course' : 'book';
});

/**
 * Virtual for content ID
 */
progressSchema.virtual('contentId').get(function() {
  return this.courseId || this.bookId;
});

/**
 * Method to check if content is completed
 */
progressSchema.methods.isCompleted = function() {
  return this.completionPercentage >= 100;
};

/**
 * Method to update completion percentage
 */
progressSchema.methods.updateCompletion = function(percentage) {
  this.completionPercentage = Math.max(0, Math.min(100, percentage));
  
  if (this.completionPercentage === 100 && !this.completedAt) {
    this.completedAt = new Date();
  } else if (this.completionPercentage < 100 && this.completedAt) {
    this.completedAt = undefined; // Clear completed date if progress drops below 100%
  }
  
  this.lastAccessedAt = new Date();
  return this.save();
};

/**
 * Method to add time spent
 */
progressSchema.methods.addTimeSpent = function(minutes) {
  const time = parseInt(minutes) || 0;
  this.timeSpent = Math.max(0, this.timeSpent + time);
  this.lastAccessedAt = new Date();
  return this.save();
};

/**
 * Static method to get user's overall progress statistics
 */
progressSchema.statics.getUserStats = async function(userId) {
  const stats = await this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalItems: { $sum: 1 },
        completedItems: {
          $sum: { $cond: [{ $gte: ['$completionPercentage', 100] }, 1, 0] }
        },
        averageCompletion: { $avg: '$completionPercentage' },
        totalTimeSpent: { $sum: '$timeSpent' }
      }
    }
  ]);
  
  return stats.length > 0 ? stats[0] : {
    totalItems: 0,
    completedItems: 0,
    averageCompletion: 0,
    totalTimeSpent: 0
  };
};

/**
 * Static method to get user's recent progress
 */
progressSchema.statics.getRecentProgress = async function(userId, limit = 10) {
  return this.find({ userId })
    .populate('courseId', 'title thumbnail duration')
    .populate('bookId', 'title author cover pages')
    .sort({ lastAccessedAt: -1 })
    .limit(limit);
};

const Progress = mongoose.model('Progress', progressSchema);

module.exports = Progress;