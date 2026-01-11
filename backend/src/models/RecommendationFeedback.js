const mongoose = require('mongoose');

/**
 * Recommendation Feedback Schema
 * Stores user feedback on AI-generated recommendations
 */
const recommendationFeedbackSchema = new mongoose.Schema({
  recommendationId: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  helpful: {
    type: Boolean,
    required: true
  },
  feedback: {
    type: String,
    maxlength: [500, 'Feedback cannot exceed 500 characters'],
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: false // We manually manage createdAt
});

/**
 * Indexes for better query performance
 */
recommendationFeedbackSchema.index({ recommendationId: 1, userId: 1 }, { unique: true });
recommendationFeedbackSchema.index({ userId: 1, createdAt: -1 });
recommendationFeedbackSchema.index({ helpful: 1 });

const RecommendationFeedback = mongoose.model('RecommendationFeedback', recommendationFeedbackSchema);

module.exports = RecommendationFeedback;