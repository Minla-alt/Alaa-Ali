const Book = require('../models/Book');
const SavedContent = require('../models/SavedContent');
const mongoose = require('mongoose');

/**
 * @desc    Get all books with filtering, searching, and pagination
 * @route   GET /api/books
 * @access  Public
 */
const getAllBooks = async (req, res) => {
  try {
    // Extract query parameters
    const { 
      subject, 
      educationLevel, 
      language, 
      search, 
      page = 1, 
      limit = 10 
    } = req.query;

    // Build MongoDB query
    const query = { isActive: true };

    // Add filters
    if (subject) {
      const validSubjects = ['Math', 'Science', 'Languages', 'Programming', 'Other'];
      if (!validSubjects.includes(subject)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid subject. Must be one of: Math, Science, Languages, Programming, Other'
        });
      }
      query.subject = subject;
    }

    if (educationLevel) {
      const validLevels = ['HighSchool', 'University', 'SelfPaced'];
      if (!validLevels.includes(educationLevel)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid education level. Must be one of: HighSchool, University, SelfPaced'
        });
      }
      query.educationLevel = educationLevel;
    }

    if (language) {
      const validLanguages = ['ar', 'en', 'bilingual'];
      if (!validLanguages.includes(language)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid language. Must be one of: ar, en, bilingual'
        });
      }
      query.language = language;
    }

    // Add search functionality
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: { $regex: searchRegex } },
        { description: { $regex: searchRegex } },
        { author: { $regex: searchRegex } },
        { publisher: { $regex: searchRegex } },
        { source: { $regex: searchRegex } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    // Get total count for pagination
    const total = await Book.countDocuments(query);

    // Execute query with pagination
    const books = await Book.find(query)
      .sort({ publicationYear: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // If user is authenticated, check which books are saved
    let booksWithSaveStatus = books;
    if (req.user && req.user.userId) {
      const savedBooks = await SavedContent.find({
        userId: req.user.userId,
        bookId: { $in: books.map(book => book._id) }
      });

      const savedBookIds = new Set(savedBooks.map(sb => sb.bookId.toString()));
      
      booksWithSaveStatus = books.map(book => ({
        ...book.toObject(),
        isSaved: savedBookIds.has(book._id.toString())
      }));
    }

    const totalPages = Math.ceil(total / limitNum);

    res.status(200).json({
      success: true,
      books: booksWithSaveStatus,
      pagination: {
        total,
        page: parseInt(page),
        pages: totalPages,
        limit: limitNum,
        hasNextPage: skip + limitNum < total,
        hasPrevPage: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('Error in getAllBooks:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching books',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * @desc    Get single book by ID
 * @route   GET /api/books/:id
 * @access  Public
 */
const getBookById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid book ID format'
      });
    }

    // Find book
    const book = await Book.findById(id);

    if (!book || !book.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // If user is authenticated, check if book is saved
    let isSaved = false;
    let savedAt = null;
    
    if (req.user && req.user.userId) {
      const savedContent = await SavedContent.findOne({
        userId: req.user.userId,
        bookId: id
      });
      
      if (savedContent) {
        isSaved = true;
        savedAt = savedContent.savedAt;
      }
    }

    res.status(200).json({
      success: true,
      book: {
        ...book.toObject(),
        isSaved,
        savedAt
      }
    });

  } catch (error) {
    console.error('Error in getBookById:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching book',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * @desc    Save a book to user's saved content
 * @route   POST /api/books/:id/save
 * @access  Private
 */
const saveBook = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    // Validate MongoDB ObjectId
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid book ID format'
      });
    }

    // Check if book exists
    const book = await Book.findById(id);
    if (!book || !book.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // Check if already saved
    const existingSaved = await SavedContent.findOne({
      userId: req.user.userId,
      bookId: id
    });

    if (existingSaved) {
      return res.status(409).json({
        success: false,
        message: 'Book is already saved',
        savedContentId: existingSaved._id
      });
    }

    // Create new saved content
    const savedContent = new SavedContent({
      userId: req.user.userId,
      bookId: id,
      notes: notes || ''
    });

    await savedContent.save();

    res.status(200).json({
      success: true,
      message: 'Book saved successfully',
      savedContentId: savedContent._id
    });

  } catch (error) {
    console.error('Error in saveBook:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while saving book',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * @desc    Unsave a book from user's saved content
 * @route   DELETE /api/books/:id/save
 * @access  Private
 */
const unsaveBook = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid book ID format'
      });
    }

    // Find and delete saved content
    const deleted = await SavedContent.findOneAndDelete({
      userId: req.user.userId,
      bookId: id
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Saved book not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Book unsaved successfully'
    });

  } catch (error) {
    console.error('Error in unsaveBook:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while unsaving book',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * @desc    Get user's saved books
 * @route   GET /api/books/user/saved
 * @access  Private
 */
const getUserSavedBooks = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    // Find user's saved books
    const savedContent = await SavedContent.find({
      userId: req.user.userId,
      bookId: { $ne: null }
    })
      .populate('bookId')
      .sort({ savedAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Get total count for pagination
    const total = await SavedContent.countDocuments({
      userId: req.user.userId,
      bookId: { $ne: null }
    });

    // Filter out null book references and format response
    const books = savedContent
      .filter(sc => sc.bookId) // Filter out where bookId was deleted
      .map(sc => ({
        ...sc.bookId.toObject(),
        isSaved: true,
        savedAt: sc.savedAt,
        notes: sc.notes,
        savedContentId: sc._id
      }));

    const totalPages = Math.ceil(total / limitNum);

    res.status(200).json({
      success: true,
      books,
      pagination: {
        total,
        page: parseInt(page),
        pages: totalPages,
        limit: limitNum,
        hasNextPage: skip + limitNum < total,
        hasPrevPage: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('Error in getUserSavedBooks:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching saved books',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
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