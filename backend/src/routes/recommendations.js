const express = require('express');
const { verifyToken } = require('../middleware/auth');
const {
  getDailyRecommendation,
  submitFeedback
} = require('../controllers/recommendationsController');

const router = express.Router();

/**
 * @route   GET /api/recommendations/daily
 * @desc    Get AI-generated daily learning recommendation
 * @access  Private (requires JWT)
 * @params  subject (optional): Math, Science, Languages, Programming
 * @params  timeAvailable (optional): estimated time in minutes (5-480)
 * @params  forceRefresh (optional): boolean to bypass cache
 */
router.get('/daily', verifyToken, getDailyRecommendation);

/**
 * @route   POST /api/recommendations/feedback
 * @desc    Submit feedback on recommendation
 * @access  Private (requires JWT)
 * @body    recommendationId: string, helpful: boolean, feedback: string (optional)
 */
router.post('/feedback', verifyToken, submitFeedback);

module.exports = router;