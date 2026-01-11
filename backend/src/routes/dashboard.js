const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const {
  getStats,
  getProgress,
  getSavedContent,
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  updateProgress
} = require('../controllers/dashboardController');

/**
 * Dashboard Routes
 * Base path: /api/dashboard
 * All routes require JWT authentication
 */

/**
 * @route   GET /api/dashboard/stats
 * @desc    Get user's learning statistics and overview
 * @access  Private (requires valid token)
 */
router.get('/stats', verifyToken, getStats);

/**
 * @route   GET /api/dashboard/progress
 * @desc    Get user's progress on all courses and books
 * @access  Private (requires valid token)
 */
router.get('/progress', verifyToken, getProgress);

/**
 * @route   GET /api/dashboard/saved-content
 * @desc    Get user's saved courses and books summary
 * @access  Private (requires valid token)
 * @query   type (optional): "courses" | "books" | all (default: all)
 * @query   limit (optional): number of items to return (default: 10)
 */
router.get('/saved-content', verifyToken, getSavedContent);

/**
 * @route   GET /api/dashboard/todos
 * @desc    Get user's study todos/tasks
 * @access  Private (requires valid token)
 * @query   status (optional): "pending" | "in_progress" | "completed" | all (default: pending)
 * @query   limit (optional): number of items to return (default: 10)
 */
router.get('/todos', verifyToken, getTodos);

/**
 * @route   POST /api/dashboard/todos
 * @desc    Create a new study todo
 * @access  Private (requires valid token)
 * @body    title (required), description (optional), priority (optional), dueDate (optional), courseId (optional), bookId (optional)
 */
router.post('/todos', verifyToken, createTodo);

/**
 * @route   PATCH /api/dashboard/todos/:todoId
 * @desc    Update a study todo
 * @access  Private (requires valid token)
 * @body    title, description, status, priority, dueDate
 */
router.patch('/todos/:todoId', verifyToken, updateTodo);

/**
 * @route   DELETE /api/dashboard/todos/:todoId
 * @desc    Delete a study todo
 * @access  Private (requires valid token)
 */
router.delete('/todos/:todoId', verifyToken, deleteTodo);

/**
 * @route   PATCH /api/dashboard/progress/:contentId
 * @desc    Update progress on a course or book
 * @access  Private (requires valid token)
 * @body    completionPercentage (0-100), notes (optional), courseId (optional), bookId (optional)
 */
router.patch('/progress/:contentId', verifyToken, updateProgress);

module.exports = router;
