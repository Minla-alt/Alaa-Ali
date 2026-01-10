const mongoose = require('mongoose');

/**
 * Course Schema
 * Represents courses in the bilingual educational platform
 */
const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true,
    maxlength: [200, 'Course title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Course description cannot exceed 1000 characters']
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    enum: {
      values: ['Math', 'Science', 'Languages', 'Programming', 'Other'],
      message: 'Subject must be one of: Math, Science, Languages, Programming, Other'
    }
  },
  educationLevel: {
    type: String,
    required: [true, 'Education level is required'],
    enum: {
      values: ['HighSchool', 'University', 'SelfPaced'],
      message: 'Education level must be one of: HighSchool, University, SelfPaced'
    }
  },
  language: {
    type: String,
    required: [true, 'Language is required'],
    enum: {
      values: ['ar', 'en', 'bilingual'],
      message: 'Language must be one of: ar, en, bilingual'
    }
  },
  source: {
    type: String,
    required: [true, 'Source is required'],
    trim: true,
    maxlength: [100, 'Source cannot exceed 100 characters']
  },
  sourceUrl: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        if (v && v.trim() !== '') {
          return /^https?:\/\/.+/.test(v);
        }
        return true; // Allow empty or null values
      },
      message: 'Source URL must be a valid HTTP/HTTPS URL'
    }
  },
  thumbnail: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        if (v && v.trim() !== '') {
          return /^https?:\/\/.+/.test(v);
        }
        return true; // Allow empty or null values
      },
      message: 'Thumbnail URL must be a valid HTTP/HTTPS URL'
    }
  },
  duration: {
    type: Number,
    min: [1, 'Duration must be at least 1 minute'],
    max: [10000, 'Duration cannot exceed 10000 minutes']
  },
  // Additional fields for enhanced functionality
  isActive: {
    type: Boolean,
    default: true
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Each tag cannot exceed 50 characters']
  }],
  instructor: {
    name: String,
    bio: String,
    avatar: String
  }
}, {
  timestamps: true
});

/**
 * Indexes for better query performance
 */
courseSchema.index({ subject: 1, educationLevel: 1 });
courseSchema.index({ language: 1 });
courseSchema.index({ source: 1 });
courseSchema.index({ isActive: 1 });
courseSchema.index({ createdAt: -1 });

/**
 * Virtual for course URL (for frontend routing)
 */
courseSchema.virtual('courseUrl').get(function() {
  return `/courses/${this._id}`;
});

/**
 * Method to get course statistics
 */
courseSchema.methods.getStats = function() {
  // This will be populated when we create the Progress model
  return {
    totalStudents: 0,
    averageRating: 0,
    completionRate: 0
  };
};

/**
 * Static method to find courses by language
 */
courseSchema.statics.findByLanguage = function(language) {
  return this.find({ 
    language: language,
    isActive: true 
  }).sort({ createdAt: -1 });
};

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;