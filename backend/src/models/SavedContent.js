const mongoose = require('mongoose');

/**
 * SavedContent Schema
 * Tracks content (courses/books) that users have saved for later
 */
const savedContentSchema = new mongoose.Schema({
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
  savedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  // Additional fields for enhanced functionality
  category: {
    type: String,
    trim: true,
    maxlength: [50, 'Category cannot exceed 50 characters'],
    default: 'general'
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Each tag cannot exceed 30 characters']
  }],
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  isRead: {
    type: Boolean,
    default: false // For books
  },
  isCompleted: {
    type: Boolean,
    default: false // For courses
  },
  reminder: {
    enabled: {
      type: Boolean,
      default: false
    },
    remindAt: {
      type: Date
    },
    message: {
      type: String,
      trim: true,
      maxlength: [200, 'Reminder message cannot exceed 200 characters']
    }
  }
}, {
  timestamps: true
});

/**
 * Compound indexes for better query performance
 */
savedContentSchema.index({ userId: 1, courseId: 1 }, { unique: true, sparse: true });
savedContentSchema.index({ userId: 1, bookId: 1 }, { unique: true, sparse: true });
savedContentSchema.index({ userId: 1, savedAt: -1 });
savedContentSchema.index({ userId: 1, priority: -1 });
savedContentSchema.index({ category: 1, userId: 1 });

/**
 * Virtual for content type
 */
savedContentSchema.virtual('type').get(function() {
  return this.courseId ? 'course' : 'book';
});

/**
 * Virtual for content ID
 */
savedContentSchema.virtual('contentId').get(function() {
  return this.courseId || this.bookId;
});

/**
 * Virtual for content title (populated)
 */
savedContentSchema.virtual('contentTitle').get(function() {
  if (this.courseId && this.courseId.title) {
    return this.courseId.title;
  }
  if (this.bookId && this.bookId.title) {
    return this.bookId.title;
  }
  return '';
});

/**
 * Method to mark content as read (for books)
 */
savedContentSchema.methods.markAsRead = function() {
  this.isRead = true;
  return this.save();
};

/**
 * Method to mark content as completed (for courses)
 */
savedContentSchema.methods.markAsCompleted = function() {
  this.isCompleted = true;
  return this.save();
};

/**
 * Method to set a reminder
 */
savedContentSchema.methods.setReminder = function(remindAt, message) {
  this.reminder = {
    enabled: true,
    remindAt: new Date(remindAt),
    message: message || 'Time to study your saved content!'
  };
  return this.save();
};

/**
 * Method to disable reminder
 */
savedContentSchema.methods.disableReminder = function() {
  this.reminder.enabled = false;
  this.reminder.remindAt = undefined;
  this.reminder.message = undefined;
  return this.save();
};

/**
 * Static method to get user's saved content statistics
 */
savedContentSchema.statics.getUserStats = async function(userId) {
  const stats = await this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalSaved: { $sum: 1 },
        coursesSaved: {
          $sum: { $cond: [{ $ne: ['$courseId', null] }, 1, 0] }
        },
        booksSaved: {
          $sum: { $cond: [{ $ne: ['$bookId', null] }, 1, 0] }
        },
        booksRead: {
          $sum: { $cond: [{ $and: [{ $ne: ['$bookId', null] }, '$isRead'] }, 1, 0] }
        },
        coursesCompleted: {
          $sum: { $cond: [{ $and: [{ $ne: ['$courseId', null] }, '$isCompleted'] }, 1, 0] }
        },
        highPriority: {
          $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] }
        }
      }
    }
  ]);
  
  return stats.length > 0 ? stats[0] : {
    totalSaved: 0,
    coursesSaved: 0,
    booksSaved: 0,
    booksRead: 0,
    coursesCompleted: 0,
    highPriority: 0
  };
};

/**
 * Static method to get user's saved content with reminders
 */
savedContentSchema.statics.getWithReminders = function(userId) {
  return this.find({
    userId,
    'reminder.enabled': true,
    'reminder.remindAt': { $lte: new Date() }
  })
    .populate('courseId', 'title thumbnail duration source')
    .populate('bookId', 'title author cover pages publisher')
    .sort({ 'reminder.remindAt': 1 });
};

/**
 * Static method to get user's saved content by category
 */
savedContentSchema.statics.getByCategory = function(userId, category) {
  return this.find({ 
    userId,
    category: category
  })
    .populate('courseId', 'title thumbnail duration source')
    .populate('bookId', 'title author cover pages publisher')
    .sort({ savedAt: -1 });
};

/**
 * Static method to search user's saved content
 */
savedContentSchema.statics.search = function(userId, searchTerm) {
  return this.find({
    userId,
    $or: [
      { notes: { $regex: searchTerm, $options: 'i' } },
      { category: { $regex: searchTerm, $options: 'i' } },
      { tags: { $regex: searchTerm, $options: 'i' } }
    ]
  })
    .populate('courseId', 'title thumbnail duration source')
    .populate('bookId', 'title author cover pages publisher')
    .sort({ savedAt: -1 });
};

const SavedContent = mongoose.model('SavedContent', savedContentSchema);

module.exports = SavedContent;