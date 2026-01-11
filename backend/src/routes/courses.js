const express = require('express');
const router = express.Router();
const {
  getAllCourses,
  getCourseById,
  saveCourse,
  unsaveCourse,
  getUserSavedCourses
} = require('../controllers/coursesController');
const { optionalAuth, verifyToken } = require('../middleware/auth');

/**
 * @route   GET /api/courses
 * @desc    Get all courses with filtering, searching, and pagination
 * @access  Public
 * @query   subject, educationLevel, language, search, page, limit
 */
router.get('/', optionalAuth, getAllCourses);

/**
 * @route   GET /api/courses/:id
 * @desc    Get single course by ID
 * @access  Public
 * @params  id (MongoDB ObjectId)
 */
router.get('/:id', optionalAuth, getCourseById);

/**
 * @route   POST /api/courses/:id/save
 * @desc    Save a course to user's saved content
 * @access  Private (requires JWT)
 * @params  id (MongoDB ObjectId)
 * @body    { notes?: string }
 */
router.post('/:id/save', verifyToken, saveCourse);

/**
 * @route   DELETE /api/courses/:id/save
 * @desc    Unsave a course from user's saved content
 * @access  Private (requires JWT)
 * @params  id (MongoDB ObjectId)
 */
router.delete('/:id/save', verifyToken, unsaveCourse);

/**
 * @route   GET /api/courses/user/saved
 * @desc    Get user's saved courses
 * @access  Private (requires JWT)
 * @query   page, limit (for pagination)
 */
router.get('/user/saved', verifyToken, getUserSavedCourses);

module.exports = router;