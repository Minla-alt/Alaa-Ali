const Course = require('../models/Course');
const SavedContent = require('../models/SavedContent');
const mongoose = require('mongoose');

/**
 * @desc    Get all courses with filtering, searching, and pagination
 * @route   GET /api/courses
 * @access  Public
 */
const getAllCourses = async (req, res) => {
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
        { source: { $regex: searchRegex } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    // Get total count for pagination
    const total = await Course.countDocuments(query);

    // Execute query with pagination
    const courses = await Course.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // If user is authenticated, check which courses are saved
    let coursesWithSaveStatus = courses;
    if (req.user && req.user.userId) {
      const savedCourses = await SavedContent.find({
        userId: req.user.userId,
        courseId: { $in: courses.map(course => course._id) }
      });

      const savedCourseIds = new Set(savedCourses.map(sc => sc.courseId.toString()));
      
      coursesWithSaveStatus = courses.map(course => ({
        ...course.toObject(),
        isSaved: savedCourseIds.has(course._id.toString())
      }));
    }

    const totalPages = Math.ceil(total / limitNum);

    res.status(200).json({
      success: true,
      courses: coursesWithSaveStatus,
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
    console.error('Error in getAllCourses:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching courses',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * @desc    Get single course by ID
 * @route   GET /api/courses/:id
 * @access  Public
 */
const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid course ID format'
      });
    }

    // Find course
    const course = await Course.findById(id);

    if (!course || !course.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // If user is authenticated, check if course is saved
    let isSaved = false;
    let savedAt = null;
    
    if (req.user && req.user.userId) {
      const savedContent = await SavedContent.findOne({
        userId: req.user.userId,
        courseId: id
      });
      
      if (savedContent) {
        isSaved = true;
        savedAt = savedContent.savedAt;
      }
    }

    res.status(200).json({
      success: true,
      course: {
        ...course.toObject(),
        isSaved,
        savedAt
      }
    });

  } catch (error) {
    console.error('Error in getCourseById:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching course',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * @desc    Save a course to user's saved content
 * @route   POST /api/courses/:id/save
 * @access  Private
 */
const saveCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    // Validate MongoDB ObjectId
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid course ID format'
      });
    }

    // Check if course exists
    const course = await Course.findById(id);
    if (!course || !course.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if already saved
    const existingSaved = await SavedContent.findOne({
      userId: req.user.userId,
      courseId: id
    });

    if (existingSaved) {
      return res.status(409).json({
        success: false,
        message: 'Course is already saved',
        savedContentId: existingSaved._id
      });
    }

    // Create new saved content
    const savedContent = new SavedContent({
      userId: req.user.userId,
      courseId: id,
      notes: notes || ''
    });

    await savedContent.save();

    res.status(200).json({
      success: true,
      message: 'Course saved successfully',
      savedContentId: savedContent._id
    });

  } catch (error) {
    console.error('Error in saveCourse:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while saving course',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * @desc    Unsave a course from user's saved content
 * @route   DELETE /api/courses/:id/save
 * @access  Private
 */
const unsaveCourse = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid course ID format'
      });
    }

    // Find and delete saved content
    const deleted = await SavedContent.findOneAndDelete({
      userId: req.user.userId,
      courseId: id
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Saved course not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Course unsaved successfully'
    });

  } catch (error) {
    console.error('Error in unsaveCourse:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while unsaving course',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * @desc    Get user's saved courses
 * @route   GET /api/courses/user/saved
 * @access  Private
 */
const getUserSavedCourses = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    // Find user's saved courses
    const savedContent = await SavedContent.find({
      userId: req.user.userId,
      courseId: { $ne: null }
    })
      .populate('courseId')
      .sort({ savedAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Get total count for pagination
    const total = await SavedContent.countDocuments({
      userId: req.user.userId,
      courseId: { $ne: null }
    });

    // Filter out null course references and format response
    const courses = savedContent
      .filter(sc => sc.courseId) // Filter out where courseId was deleted
      .map(sc => ({
        ...sc.courseId.toObject(),
        isSaved: true,
        savedAt: sc.savedAt,
        notes: sc.notes,
        savedContentId: sc._id
      }));

    const totalPages = Math.ceil(total / limitNum);

    res.status(200).json({
      success: true,
      courses,
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
    console.error('Error in getUserSavedCourses:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching saved courses',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  getAllCourses,
  getCourseById,
  saveCourse,
  unsaveCourse,
  getUserSavedCourses
};