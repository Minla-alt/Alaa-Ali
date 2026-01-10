const mongoose = require('mongoose');

const Book = require('../models/Book');
const SavedContent = require('../models/SavedContent');

const VALID_SUBJECTS = ['Math', 'Science', 'Languages', 'Programming'];
const VALID_EDUCATION_LEVELS = ['HighSchool', 'University', 'SelfPaced'];
const VALID_LANGUAGES = ['ar', 'en', 'bilingual'];

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const parsePositiveInt = (value, defaultValue, { min = 1, max = 1000 } = {}) => {
  if (value === undefined) return defaultValue;

  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < min || parsed > max) {
    return null;
  }

  return parsed;
};

/**
 * GET /api/books
 * Public (optional auth for isSaved flag)
 */
const getAllBooks = async (req, res) => {
  try {
    const { subject, educationLevel, language, search } = req.query;

    if (subject && !VALID_SUBJECTS.includes(subject)) {
      return res.status(400).json({
        success: false,
        message: `Invalid subject. Allowed values: ${VALID_SUBJECTS.join(', ')}`,
        statusCode: 400
      });
    }

    if (educationLevel && !VALID_EDUCATION_LEVELS.includes(educationLevel)) {
      return res.status(400).json({
        success: false,
        message: `Invalid educationLevel. Allowed values: ${VALID_EDUCATION_LEVELS.join(', ')}`,
        statusCode: 400
      });
    }

    if (language && !VALID_LANGUAGES.includes(language)) {
      return res.status(400).json({
        success: false,
        message: `Invalid language. Allowed values: ${VALID_LANGUAGES.join(', ')}`,
        statusCode: 400
      });
    }

    const page = parsePositiveInt(req.query.page, 1, { min: 1, max: 1000000 });
    const limit = parsePositiveInt(req.query.limit, 10, { min: 1, max: 100 });

    if (!page) {
      return res.status(400).json({
        success: false,
        message: 'Invalid page parameter. Must be a positive integer.',
        statusCode: 400
      });
    }

    if (!limit) {
      return res.status(400).json({
        success: false,
        message: 'Invalid limit parameter. Must be a positive integer (max 100).',
        statusCode: 400
      });
    }

    const query = { isActive: true };

    if (subject) query.subject = subject;
    if (educationLevel) query.educationLevel = educationLevel;
    if (language) query.language = language;

    if (search && typeof search === 'string' && search.trim() !== '') {
      const escaped = escapeRegex(search.trim());
      const regex = new RegExp(escaped, 'i');
      query.$or = [{ title: regex }, { description: regex }];
    }

    const total = await Book.countDocuments(query);
    const skip = (page - 1) * limit;

    let books = await Book.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    if (req.user?.userId && books.length > 0) {
      const bookIds = books.map((b) => b._id);
      const saved = await SavedContent.find({
        userId: req.user.userId,
        bookId: { $in: bookIds }
      })
        .select('bookId savedAt')
        .lean();

      const savedMap = new Map(saved.map((s) => [s.bookId.toString(), s.savedAt]));

      books = books.map((book) => {
        const savedAt = savedMap.get(book._id.toString()) || null;
        return {
          ...book,
          isSaved: Boolean(savedAt),
          savedAt
        };
      });
    }

    const pages = Math.ceil(total / limit);

    return res.status(200).json({
      success: true,
      books,
      total,
      page,
      pages
    });
  } catch (error) {
    console.error('Get all books error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error fetching books',
      statusCode: 500
    });
  }
};

/**
 * GET /api/books/:id
 * Public (optional auth for isSaved flag)
 */
const getBookById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid book ID',
        statusCode: 400
      });
    }

    const book = await Book.findById(id).lean();

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found',
        statusCode: 404
      });
    }

    if (req.user?.userId) {
      const saved = await SavedContent.findOne({ userId: req.user.userId, bookId: id })
        .select('savedAt')
        .lean();

      book.isSaved = Boolean(saved);
      book.savedAt = saved?.savedAt || null;
    }

    return res.status(200).json({
      success: true,
      book
    });
  } catch (error) {
    console.error('Get book by id error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error fetching book',
      statusCode: 500
    });
  }
};

/**
 * POST /api/books/:id/save
 * Protected
 */
const saveBook = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid book ID',
        statusCode: 400
      });
    }

    const bookExists = await Book.exists({ _id: id });
    if (!bookExists) {
      return res.status(404).json({
        success: false,
        message: 'Book not found',
        statusCode: 404
      });
    }

    const { notes } = req.body || {};
    if (notes !== undefined && (typeof notes !== 'string' || notes.length > 1000)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid notes. Must be a string up to 1000 characters.',
        statusCode: 400
      });
    }

    let saved = await SavedContent.findOne({ userId: req.user.userId, bookId: id });

    if (!saved) {
      try {
        saved = await SavedContent.create({
          userId: req.user.userId,
          bookId: id,
          notes
        });
      } catch (error) {
        if (error.code === 11000) {
          saved = await SavedContent.findOne({ userId: req.user.userId, bookId: id });
        } else {
          throw error;
        }
      }
    } else if (notes !== undefined) {
      saved.notes = notes;
      await saved.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Book saved',
      savedContentId: saved._id.toString()
    });
  } catch (error) {
    console.error('Save book error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error saving book',
      statusCode: 500
    });
  }
};

/**
 * DELETE /api/books/:id/save
 * Protected
 */
const unsaveBook = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid book ID',
        statusCode: 400
      });
    }

    await SavedContent.deleteOne({ userId: req.user.userId, bookId: id });

    return res.status(200).json({
      success: true,
      message: 'Book unsaved'
    });
  } catch (error) {
    console.error('Unsave book error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error unsaving book',
      statusCode: 500
    });
  }
};

/**
 * GET /api/books/user/saved
 * Protected
 */
const getUserSavedBooks = async (req, res) => {
  try {
    const page = parsePositiveInt(req.query.page, 1, { min: 1, max: 1000000 });
    const limit = parsePositiveInt(req.query.limit, 10, { min: 1, max: 100 });

    if (!page) {
      return res.status(400).json({
        success: false,
        message: 'Invalid page parameter. Must be a positive integer.',
        statusCode: 400
      });
    }

    if (!limit) {
      return res.status(400).json({
        success: false,
        message: 'Invalid limit parameter. Must be a positive integer (max 100).',
        statusCode: 400
      });
    }

    const baseQuery = {
      userId: req.user.userId,
      bookId: { $exists: true, $ne: null }
    };

    const total = await SavedContent.countDocuments(baseQuery);

    const savedItems = await SavedContent.find(baseQuery)
      .sort({ savedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('bookId')
      .lean();

    const books = savedItems
      .filter((item) => item.bookId)
      .map((item) => ({
        ...item.bookId,
        isSaved: true,
        savedAt: item.savedAt
      }));

    const pages = Math.ceil(total / limit);

    return res.status(200).json({
      success: true,
      books,
      total,
      page,
      pages
    });
  } catch (error) {
    console.error('Get user saved books error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error fetching saved books',
      statusCode: 500
    });
  }
};

module.exports = {
  getAllBooks,
  getBookById,
  saveBook,
  unsaveBook,
  getUserSavedBooks
};
