const mongoose = require('mongoose');
const User = require('../models/User');
const Course = require('../models/Course');
const Book = require('../models/Book');
const Progress = require('../models/Progress');
const StudyTodo = require('../models/StudyTodo');
const SavedContent = require('../models/SavedContent');

/**
 * Get User Statistics
 * GET /api/dashboard/stats
 */
const getStats = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get user info for join date
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        statusCode: 404
      });
    }

    // Count saved courses
    const totalSavedCourses = await SavedContent.countDocuments({
      userId,
      courseId: { $exists: true }
    });

    // Count saved books
    const totalSavedBooks = await SavedContent.countDocuments({
      userId,
      bookId: { $exists: true }
    });

    // Count completed courses
    const totalCoursesCompleted = await Progress.countDocuments({
      userId,
      courseId: { $exists: true },
      completedAt: { $exists: true }
    });

    // Count completed books
    const totalBooksCompleted = await Progress.countDocuments({
      userId,
      bookId: { $exists: true },
      completedAt: { $exists: true }
    });

    // Get all progress records for calculating average
    const progressRecords = await Progress.find({ userId });

    // Calculate average progress
    let averageProgress = 0;
    if (progressRecords.length > 0) {
      const totalProgress = progressRecords.reduce((sum, record) => sum + record.completionPercentage, 0);
      averageProgress = Math.round(totalProgress / progressRecords.length);
    }

    // Calculate total learning hours (from completed courses with duration)
    const completedCourseIds = progressRecords
      .filter(p => p.courseId && p.completedAt)
      .map(p => p.courseId);

    let totalLearningHours = 0;
    if (completedCourseIds.length > 0) {
      const courses = await Course.find({ _id: { $in: completedCourseIds } });
      totalLearningHours = courses.reduce((sum, course) => {
        const hours = (course.duration || 0) / 60;
        return sum + hours;
      }, 0);
    }

    // Get last activity date (most recent lastAccessedAt)
    let lastActivityDate = null;
    if (progressRecords.length > 0) {
      const sortedByAccess = progressRecords.sort((a, b) => 
        new Date(b.lastAccessedAt) - new Date(a.lastAccessedAt)
      );
      lastActivityDate = sortedByAccess[0].lastAccessedAt;
    }

    return res.status(200).json({
      success: true,
      stats: {
        totalSavedCourses,
        totalSavedBooks,
        totalCoursesCompleted,
        totalBooksCompleted,
        averageProgress,
        totalLearningHours: Math.round(totalLearningHours * 10) / 10,
        joinDate: user.createdAt,
        lastActivityDate
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching statistics',
      statusCode: 500
    });
  }
};

/**
 * Get User Progress
 * GET /api/dashboard/progress
 */
const getProgress = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get all progress records
    const progressRecords = await Progress.find({ userId })
      .populate('courseId', 'title thumbnail duration')
      .populate('bookId', 'title author cover pages')
      .sort({ lastAccessedAt: -1 });

    // Format progress response
    const progress = progressRecords.map(record => {
      const isCourse = !!record.courseId;
      const content = isCourse ? record.courseId : record.bookId;

      return {
        contentId: record.courseId || record.bookId,
        contentType: isCourse ? 'course' : 'book',
        title: content ? content.title : 'Unknown Content',
        thumbnail: content ? (content.thumbnail || content.cover) : null,
        completionPercentage: record.completionPercentage,
        lastAccessedAt: record.lastAccessedAt,
        completedAt: record.completedAt || null,
        notes: record.notes || null
      };
    });

    return res.status(200).json({
      success: true,
      progress
    });
  } catch (error) {
    console.error('Get progress error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching progress',
      statusCode: 500
    });
  }
};

/**
 * Get Saved Content
 * GET /api/dashboard/saved-content
 */
const getSavedContent = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { type, limit } = req.query;

    const limitNum = limit ? parseInt(limit) : 10;
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        success: false,
        message: 'Limit must be between 1 and 100',
        statusCode: 400
      });
    }

    let courses = [];
    let books = [];
    let total = 0;

    // Get saved courses
    if (!type || type === 'all' || type === 'courses') {
      const savedCourses = await SavedContent.find({
        userId,
        courseId: { $exists: true }
      })
        .populate('courseId', 'title thumbnail duration subject educationLevel language source')
        .sort({ savedAt: -1 })
        .limit(type === 'courses' ? limitNum : limitNum);

      courses = savedCourses
        .filter(item => item.courseId)
        .map(item => ({
          ...item.courseId.toObject(),
          savedAt: item.savedAt
        }));
    }

    // Get saved books
    if (!type || type === 'all' || type === 'books') {
      const savedBooks = await SavedContent.find({
        userId,
        bookId: { $exists: true }
      })
        .populate('bookId', 'title author cover pages subject educationLevel language source')
        .sort({ savedAt: -1 })
        .limit(type === 'books' ? limitNum : limitNum);

      books = savedBooks
        .filter(item => item.bookId)
        .map(item => ({
          ...item.bookId.toObject(),
          savedAt: item.savedAt
        }));
    }

    // Apply limit if type is 'all'
    if (type === 'all' || !type) {
      const combined = [
        ...courses.map(c => ({ ...c, type: 'course' })),
        ...books.map(b => ({ ...b, type: 'book' }))
      ].sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt))
        .slice(0, limitNum);

      courses = combined.filter(item => item.type === 'course');
      books = combined.filter(item => item.type === 'book');
    }

    total = courses.length + books.length;

    return res.status(200).json({
      success: true,
      courses,
      books,
      total
    });
  } catch (error) {
    console.error('Get saved content error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching saved content',
      statusCode: 500
    });
  }
};

/**
 * Get Todos
 * GET /api/dashboard/todos
 */
const getTodos = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { status, limit } = req.query;

    const limitNum = limit ? parseInt(limit) : 10;
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        success: false,
        message: 'Limit must be between 1 and 100',
        statusCode: 400
      });
    }

    // Build query
    const query = { userId };
    if (status && status !== 'all') {
      if (!['pending', 'in_progress', 'completed'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Status must be one of: pending, in_progress, completed',
          statusCode: 400
        });
      }
      query.status = status;
    }

    // Get todos
    const todos = await StudyTodo.find(query)
      .populate('courseId', 'title')
      .populate('bookId', 'title')
      .sort({ priority: -1, dueDate: 1, createdAt: -1 })
      .limit(limitNum);

    // Format todos response
    const formattedTodos = todos.map(todo => ({
      id: todo._id,
      title: todo.title,
      description: todo.description,
      status: todo.status,
      priority: todo.priority,
      dueDate: todo.dueDate,
      completedAt: todo.completedAt,
      relatedCourse: todo.courseId ? {
        id: todo.courseId._id,
        title: todo.courseId.title
      } : null,
      relatedBook: todo.bookId ? {
        id: todo.bookId._id,
        title: todo.bookId.title
      } : null,
      createdAt: todo.createdAt
    }));

    // Get counts by status
    const statusCounts = await StudyTodo.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const byStatus = {
      pending: 0,
      in_progress: 0,
      completed: 0
    };

    statusCounts.forEach(item => {
      byStatus[item._id] = item.count;
    });

    const total = await StudyTodo.countDocuments(query);

    return res.status(200).json({
      success: true,
      todos: formattedTodos,
      total,
      byStatus
    });
  } catch (error) {
    console.error('Get todos error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching todos',
      statusCode: 500
    });
  }
};

/**
 * Create Todo
 * POST /api/dashboard/todos
 */
const createTodo = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { title, description, priority, dueDate, courseId, bookId } = req.body;

    // Validate required fields
    if (!title || title.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Title is required',
        statusCode: 400
      });
    }

    // Validate priority if provided
    if (priority && !['low', 'medium', 'high'].includes(priority)) {
      return res.status(400).json({
        success: false,
        message: 'Priority must be one of: low, medium, high',
        statusCode: 400
      });
    }

    // Validate dueDate if provided
    if (dueDate && new Date(dueDate) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Due date must be in the future',
        statusCode: 400
      });
    }

    // Validate courseId if provided
    if (courseId) {
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found',
          statusCode: 404
        });
      }
    }

    // Validate bookId if provided
    if (bookId) {
      const book = await Book.findById(bookId);
      if (!book) {
        return res.status(404).json({
          success: false,
          message: 'Book not found',
          statusCode: 404
        });
      }
    }

    // Create todo
    const todo = await StudyTodo.create({
      userId,
      title: title.trim(),
      description: description?.trim() || null,
      priority: priority || 'medium',
      dueDate: dueDate || null,
      courseId: courseId || null,
      bookId: bookId || null
    });

    return res.status(201).json({
      success: true,
      message: 'Todo created',
      todoId: todo._id.toString()
    });
  } catch (error) {
    console.error('Create todo error:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
        statusCode: 400
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error creating todo',
      statusCode: 500
    });
  }
};

/**
 * Update Todo
 * PATCH /api/dashboard/todos/:todoId
 */
const updateTodo = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { todoId } = req.params;
    const { title, description, status, priority, dueDate } = req.body;

    // Find todo
    const todo = await StudyTodo.findById(todoId);
    if (!todo) {
      return res.status(404).json({
        success: false,
        message: 'Todo not found',
        statusCode: 404
      });
    }

    // Check ownership
    if (todo.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this todo',
        statusCode: 403
      });
    }

    // Validate status if provided
    if (status && !['pending', 'in_progress', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be one of: pending, in_progress, completed',
        statusCode: 400
      });
    }

    // Validate priority if provided
    if (priority && !['low', 'medium', 'high'].includes(priority)) {
      return res.status(400).json({
        success: false,
        message: 'Priority must be one of: low, medium, high',
        statusCode: 400
      });
    }

    // Validate dueDate if provided
    if (dueDate && new Date(dueDate) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Due date must be in the future',
        statusCode: 400
      });
    }

    // Update fields
    if (title !== undefined) todo.title = title.trim();
    if (description !== undefined) todo.description = description?.trim() || null;
    if (status !== undefined) todo.status = status;
    if (priority !== undefined) todo.priority = priority;
    if (dueDate !== undefined) todo.dueDate = dueDate || null;

    await todo.save();

    return res.status(200).json({
      success: true,
      message: 'Todo updated'
    });
  } catch (error) {
    console.error('Update todo error:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
        statusCode: 400
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error updating todo',
      statusCode: 500
    });
  }
};

/**
 * Delete Todo
 * DELETE /api/dashboard/todos/:todoId
 */
const deleteTodo = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { todoId } = req.params;

    // Find todo
    const todo = await StudyTodo.findById(todoId);
    if (!todo) {
      return res.status(404).json({
        success: false,
        message: 'Todo not found',
        statusCode: 404
      });
    }

    // Check ownership
    if (todo.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this todo',
        statusCode: 403
      });
    }

    await StudyTodo.findByIdAndDelete(todoId);

    return res.status(200).json({
      success: true,
      message: 'Todo deleted'
    });
  } catch (error) {
    console.error('Delete todo error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error deleting todo',
      statusCode: 500
    });
  }
};

/**
 * Update Progress
 * PATCH /api/dashboard/progress/:contentId
 */
const updateProgress = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { contentId } = req.params;
    const { completionPercentage, notes, courseId, bookId } = req.body;

    // Validate completionPercentage if provided
    if (completionPercentage !== undefined) {
      if (typeof completionPercentage !== 'number' || completionPercentage < 0 || completionPercentage > 100) {
        return res.status(400).json({
          success: false,
          message: 'Completion percentage must be between 0 and 100',
          statusCode: 400
        });
      }
    }

    // Determine content type and validate
    let finalCourseId = courseId || null;
    let finalBookId = bookId || null;

    // If courseId and bookId not provided, determine from contentId
    if (!finalCourseId && !finalBookId && contentId) {
      // Try to find as course first
      const course = await Course.findById(contentId);
      if (course) {
        finalCourseId = contentId;
      } else {
        // Try as book
        const book = await Book.findById(contentId);
        if (book) {
          finalBookId = contentId;
        } else {
          return res.status(404).json({
            success: false,
            message: 'Content not found',
            statusCode: 404
          });
        }
      }
    } else {
      // Validate provided courseId or bookId
      if (finalCourseId) {
        const course = await Course.findById(finalCourseId);
        if (!course) {
          return res.status(404).json({
            success: false,
            message: 'Course not found',
            statusCode: 404
          });
        }
      }

      if (finalBookId) {
        const book = await Book.findById(finalBookId);
        if (!book) {
          return res.status(404).json({
            success: false,
            message: 'Book not found',
            statusCode: 404
          });
        }
      }
    }

    // Find or create progress record
    let progress = await Progress.findOne({
      userId,
      courseId: finalCourseId || null,
      bookId: finalBookId || null
    });

    if (!progress) {
      // Create new progress record
      progress = await Progress.create({
        userId,
        courseId: finalCourseId || null,
        bookId: finalBookId || null,
        completionPercentage: completionPercentage || 0,
        notes: notes?.trim() || null
      });
    } else {
      // Update existing progress record
      if (completionPercentage !== undefined) {
        progress.completionPercentage = completionPercentage;

        // Set or clear completedAt based on completion percentage
        if (completionPercentage >= 100 && !progress.completedAt) {
          progress.completedAt = new Date();
        } else if (completionPercentage < 100 && progress.completedAt) {
          progress.completedAt = undefined;
        }
      }

      if (notes !== undefined) {
        progress.notes = notes?.trim() || null;
      }

      progress.lastAccessedAt = new Date();
      await progress.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Progress updated',
      completionPercentage: progress.completionPercentage
    });
  } catch (error) {
    console.error('Update progress error:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
        statusCode: 400
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error updating progress',
      statusCode: 500
    });
  }
};

module.exports = {
  getStats,
  getProgress,
  getSavedContent,
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  updateProgress
};
