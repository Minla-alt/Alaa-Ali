const mongoose = require('mongoose');

/**
 * StudyTodo Schema
 * Manages user's study tasks and to-do items
 */
const studyTodoSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: false
  },
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: false
  },
  title: {
    type: String,
    required: [true, 'Todo title is required'],
    trim: true,
    maxlength: [200, 'Todo title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Todo description cannot exceed 1000 characters']
  },
  status: {
    type: String,
    required: true,
    enum: {
      values: ['pending', 'in_progress', 'completed'],
      message: 'Status must be one of: pending, in_progress, completed'
    },
    default: 'pending',
    index: true
  },
  dueDate: {
    type: Date,
    validate: {
      validator: function(v) {
        // Due date should be in the future (or allow same day)
        if (v && v < new Date()) {
          return false;
        }
        return true;
      },
      message: 'Due date must be in the future'
    }
  },
  priority: {
    type: String,
    required: true,
    enum: {
      values: ['low', 'medium', 'high'],
      message: 'Priority must be one of: low, medium, high'
    },
    default: 'medium',
    index: true
  },
  // Additional fields for enhanced functionality
  estimatedTime: {
    type: Number, // in minutes
    min: [1, 'Estimated time must be at least 1 minute'],
    max: [10080, 'Estimated time cannot exceed 1 week (10080 minutes)']
  },
  actualTime: {
    type: Number, // in minutes
    min: [0, 'Actual time cannot be negative'],
    default: 0
  },
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
  completedAt: {
    type: Date,
    validate: {
      validator: function(v) {
        // completedAt should only be set when status is completed
        if (v && this.status !== 'completed') {
          return false;
        }
        return true;
      },
      message: 'Completed date can only be set when status is completed'
    }
  },
  reminder: {
    enabled: {
      type: Boolean,
      default: false
    },
    remindAt: {
      type: Date
    },
    type: {
      type: String,
      enum: ['email', 'notification'],
      default: 'notification'
    }
  }
}, {
  timestamps: true
});

/**
 * Indexes for better query performance
 */
studyTodoSchema.index({ userId: 1, status: 1 });
studyTodoSchema.index({ userId: 1, priority: 1 });
studyTodoSchema.index({ userId: 1, dueDate: 1 });
studyTodoSchema.index({ userId: 1, createdAt: -1 });
studyTodoSchema.index({ status: 1, dueDate: 1 });

/**
 * Virtual for completion percentage
 */
studyTodoSchema.virtual('completionPercentage').get(function() {
  return this.status === 'completed' ? 100 : 
         this.status === 'in_progress' ? 50 : 0;
});

/**
 * Virtual for overdue status
 */
studyTodoSchema.virtual('isOverdue').get(function() {
  return this.dueDate && this.dueDate < new Date() && this.status !== 'completed';
});

/**
 * Pre-save middleware to set completedAt
 */
studyTodoSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    if (this.status === 'completed' && !this.completedAt) {
      this.completedAt = new Date();
    } else if (this.status !== 'completed' && this.completedAt) {
      this.completedAt = undefined; // Clear completed date if status changes
    }
  }
  next();
});

/**
 * Method to mark todo as completed
 */
studyTodoSchema.methods.markAsCompleted = function() {
  this.status = 'completed';
  this.completedAt = new Date();
  return this.save();
};

/**
 * Method to mark todo as in progress
 */
studyTodoSchema.methods.markAsInProgress = function() {
  this.status = 'in_progress';
  return this.save();
};

/**
 * Method to mark todo as pending
 */
studyTodoSchema.methods.markAsPending = function() {
  this.status = 'pending';
  this.completedAt = undefined;
  return this.save();
};

/**
 * Method to update actual time spent
 */
studyTodoSchema.methods.updateActualTime = function(minutes) {
  const time = parseInt(minutes) || 0;
  this.actualTime = Math.max(0, this.actualTime + time);
  return this.save();
};

/**
 * Static method to get user's todo statistics
 */
studyTodoSchema.statics.getUserStats = async function(userId) {
  const stats = await this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalEstimatedTime: { $sum: '$estimatedTime' },
        totalActualTime: { $sum: '$actualTime' }
      }
    }
  ]);
  
  const result = {
    pending: 0,
    in_progress: 0,
    completed: 0,
    totalEstimatedTime: 0,
    totalActualTime: 0,
    overdue: 0
  };
  
  stats.forEach(stat => {
    result[stat._id] = stat.count;
    result.totalEstimatedTime += stat.totalEstimatedTime || 0;
    result.totalActualTime += stat.totalActualTime || 0;
  });
  
  // Get overdue count
  const overdueCount = await this.countDocuments({
    userId,
    dueDate: { $lt: new Date() },
    status: { $ne: 'completed' }
  });
  result.overdue = overdueCount;
  
  return result;
};

/**
 * Static method to get user's todos by priority
 */
studyTodoSchema.statics.getByPriority = function(userId, priority) {
  return this.find({ userId, priority })
    .populate('courseId', 'title thumbnail')
    .populate('bookId', 'title author cover')
    .sort({ dueDate: 1, priority: -1, createdAt: -1 });
};

/**
 * Static method to get user's upcoming todos
 */
studyTodoSchema.statics.getUpcoming = function(userId, days = 7) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return this.find({
    userId,
    status: { $ne: 'completed' },
    dueDate: { $lte: futureDate }
  })
    .populate('courseId', 'title thumbnail')
    .populate('bookId', 'title author cover')
    .sort({ dueDate: 1, priority: -1 });
};

const StudyTodo = mongoose.model('StudyTodo', studyTodoSchema);

module.exports = StudyTodo;