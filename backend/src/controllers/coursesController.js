const mongoose = require('mongoose');

const Course = require('../models/Course');
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
 * GET /api/courses
 * Public (optional auth for isSaved flag)
 */
const getAllCourses = async (req, res) => {
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

    const total = await Course.countDocuments(query);
    const skip = (page - 1) * limit;

    let courses = await Course.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    if (req.user?.userId && courses.length > 0) {
      const courseIds = courses.map((c) => c._id);
      const saved = await SavedContent.find({
        userId: req.user.userId,
        courseId: { $in: courseIds }
      })
        .select('courseId savedAt')
        .lean();

      const savedMap = new Map(saved.map((s) => [s.courseId.toString(), s.savedAt]));

      courses = courses.map((course) => {
        const savedAt = savedMap.get(course._id.toString()) || null;
        return {
          ...course,
          isSaved: Boolean(savedAt),
          savedAt
        };
      });
    }

    const pages = Math.ceil(total / limit);

    return res.status(200).json({
      success: true,
      courses,
      total,
      page,
      pages
    });
  } catch (error) {
    console.error('Get all courses error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error fetching courses',
      statusCode: 500
    });
  }
};

/**
 * GET /api/courses/:id
 * Public (optional auth for isSaved flag)
 */
const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid course ID',
        statusCode: 400
      });
    }

    const course = await Course.findById(id).lean();

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
        statusCode: 404
      });
    }

    if (req.user?.userId) {
      const saved = await SavedContent.findOne({ userId: req.user.userId, courseId: id })
        .select('savedAt')
        .lean();

      course.isSaved = Boolean(saved);
      course.savedAt = saved?.savedAt || null;
    }

    return res.status(200).json({
      success: true,
      course
    });
  } catch (error) {
    console.error('Get course by id error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error fetching course',
      statusCode: 500
    });
  }
};

/**
 * POST /api/courses/:id/save
 * Protected
 */
const saveCourse = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid course ID',
        statusCode: 400
      });
    }

    const courseExists = await Course.exists({ _id: id });
    if (!courseExists) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
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

    let saved = await SavedContent.findOne({ userId: req.user.userId, courseId: id });

    if (!saved) {
      try {
        saved = await SavedContent.create({
          userId: req.user.userId,
          courseId: id,
          notes
        });
      } catch (error) {
        if (error.code === 11000) {
          saved = await SavedContent.findOne({ userId: req.user.userId, courseId: id });
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
      message: 'Course saved',
      savedContentId: saved._id.toString()
    });
  } catch (error) {
    console.error('Save course error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error saving course',
      statusCode: 500
    });
  }
};

/**
 * DELETE /api/courses/:id/save
 * Protected
 */
const unsaveCourse = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid course ID',
        statusCode: 400
      });
    }

    await SavedContent.deleteOne({ userId: req.user.userId, courseId: id });

    return res.status(200).json({
      success: true,
      message: 'Course unsaved'
    });
  } catch (error) {
    console.error('Unsave course error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error unsaving course',
      statusCode: 500
    });
  }
};

/**
 * GET /api/courses/user/saved
 * Protected
 */
const getUserSavedCourses = async (req, res) => {
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
      courseId: { $exists: true, $ne: null }
    };

    const total = await SavedContent.countDocuments(baseQuery);

    const savedItems = await SavedContent.find(baseQuery)
      .sort({ savedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('courseId')
      .lean();

    const courses = savedItems
      .filter((item) => item.courseId)
      .map((item) => ({
        ...item.courseId,
        isSaved: true,
        savedAt: item.savedAt
      }));

    const pages = Math.ceil(total / limit);

    return res.status(200).json({
      success: true,
      courses,
      total,
      page,
      pages
    });
  } catch (error) {
    console.error('Get user saved courses error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error fetching saved courses',
      statusCode: 500
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
