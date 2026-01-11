const express = require('express');
const router = express.Router();
const {
  getAllBooks,
  getBookById,
  saveBook,
  unsaveBook,
  getUserSavedBooks
} = require('../controllers/booksController');
const { verifyToken, optionalAuth } = require('../middleware/auth');

/**
 * @route   GET /api/books
 * @desc    Get all books with filtering, searching, and pagination
 * @access  Public
 * @query   subject, educationLevel, language, search, page, limit
 */
router.get('/', optionalAuth, getAllBooks);

/**
 * @route   GET /api/books/:id
 * @desc    Get single book by ID
 * @access  Public
 * @params  id (MongoDB ObjectId)
 */
router.get('/:id', optionalAuth, getBookById);

/**
 * @route   POST /api/books/:id/save
 * @desc    Save a book to user's saved content
 * @access  Private (requires JWT)
 * @params  id (MongoDB ObjectId)
 * @body    { notes?: string }
 */
router.post('/:id/save', verifyToken, saveBook);

/**
 * @route   DELETE /api/books/:id/save
 * @desc    Unsave a book from user's saved content
 * @access  Private (requires JWT)
 * @params  id (MongoDB ObjectId)
 */
router.delete('/:id/save', verifyToken, unsaveBook);

/**
 * @route   GET /api/books/user/saved
 * @desc    Get user's saved books
 * @access  Private (requires JWT)
 * @query   page, limit (for pagination)
 */
router.get('/user/saved', verifyToken, getUserSavedBooks);

module.exports = router;