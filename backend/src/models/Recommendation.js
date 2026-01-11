const mongoose = require('mongoose');

/**
 * Recommendation Schema
 * Stores AI-generated learning recommendations
 */
const recommendationSchema = new mongoose.Schema({
  recommendationId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  contentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  contentType: {
    type: String,
    enum: ['course', 'book'],
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  estimatedTime: {
    type: Number,
    required: true,
    min: 1
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true
  },
  sourceUrl: {
    type: String,
    default: null
  },
  language: {
    type: String,
    enum: ['ar', 'en'],
    required: true
  },
  generatedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  viewedAt: {
    type: Date,
    default: null
  },
  actionTaken: {
    type: String,
    enum: ['saved', 'ignored', 'opened', 'completed', null],
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

/**
 * Indexes for better query performance
 */
recommendationSchema.index({ userId: 1, generatedAt: -1 });
recommendationSchema.index({ recommendationId: 1 });
recommendationSchema.index({ contentId: 1, contentType: 1 });

const Recommendation = mongoose.model('Recommendation', recommendationSchema);

module.exports = Recommendation;