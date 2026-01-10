const express = require('express');
const router = express.Router();

const { verifyToken, optionalAuth } = require('../middleware/auth');
const {
  getAllBooks,
  getBookById,
  saveBook,
  unsaveBook,
  getUserSavedBooks
} = require('../controllers/booksController');

/**
 * Books Routes
 * Base path: /api/books
 */

router.get('/', optionalAuth, getAllBooks);
router.get('/user/saved', verifyToken, getUserSavedBooks);
router.get('/:id', optionalAuth, getBookById);
router.post('/:id/save', verifyToken, saveBook);
router.delete('/:id/save', verifyToken, unsaveBook);

module.exports = router;
