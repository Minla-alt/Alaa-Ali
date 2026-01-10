const mongoose = require('mongoose');

/**
 * Book Schema
 * Represents books and reading materials in the educational platform
 */
const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Book title is required'],
    trim: true,
    maxlength: [200, 'Book title cannot exceed 200 characters']
  },
  author: {
    type: String,
    trim: true,
    maxlength: [100, 'Author name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Book description cannot exceed 1000 characters']
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
  cover: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        if (v && v.trim() !== '') {
          return /^https?:\/\/.+/.test(v);
        }
        return true; // Allow empty or null values
      },
      message: 'Cover URL must be a valid HTTP/HTTPS URL'
    }
  },
  publicationYear: {
    type: Number,
    min: [1800, 'Publication year must be after 1800'],
    max: [new Date().getFullYear() + 5, 'Publication year cannot be too far in the future']
  },
  // Additional fields for enhanced functionality
  isbn: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        if (v) {
          // Basic ISBN validation (10 or 13 digits, may contain hyphens)
          return /^(\d{9}[\dX]|\d{13})$/.test(v.replace(/-/g, ''));
        }
        return true; // Allow empty or null values
      },
      message: 'Please provide a valid ISBN'
    }
  },
  pages: {
    type: Number,
    min: [1, 'Pages must be at least 1'],
    max: [50000, 'Pages cannot exceed 50000']
  },
  publisher: {
    type: String,
    trim: true,
    maxlength: [100, 'Publisher name cannot exceed 100 characters']
  },
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
  }]
}, {
  timestamps: true
});

/**
 * Indexes for better query performance
 */
bookSchema.index({ subject: 1, educationLevel: 1 });
bookSchema.index({ language: 1 });
bookSchema.index({ author: 1 });
bookSchema.index({ publicationYear: -1 });
bookSchema.index({ isActive: 1 });
bookSchema.index({ createdAt: -1 });

/**
 * Virtual for book URL (for frontend routing)
 */
bookSchema.virtual('bookUrl').get(function() {
  return `/books/${this._id}`;
});

/**
 * Method to get book statistics
 */
bookSchema.methods.getStats = function() {
  // This will be populated when we create the Progress model
  return {
    totalReaders: 0,
    averageRating: 0,
    completionRate: 0
  };
};

/**
 * Static method to find books by language
 */
bookSchema.statics.findByLanguage = function(language) {
  return this.find({ 
    language: language,
    isActive: true 
  }).sort({ publicationYear: -1 });
};

/**
 * Static method to find books by subject
 */
bookSchema.statics.findBySubject = function(subject) {
  return this.find({ 
    subject: subject,
    isActive: true 
  }).sort({ publicationYear: -1 });
};

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;