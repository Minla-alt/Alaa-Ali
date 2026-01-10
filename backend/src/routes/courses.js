const express = require('express');
const router = express.Router();

const { verifyToken, optionalAuth } = require('../middleware/auth');
const {
  getAllCourses,
  getCourseById,
  saveCourse,
  unsaveCourse,
  getUserSavedCourses
} = require('../controllers/coursesController');

/**
 * Courses Routes
 * Base path: /api/courses
 */

router.get('/', optionalAuth, getAllCourses);
router.get('/user/saved', verifyToken, getUserSavedCourses);
router.get('/:id', optionalAuth, getCourseById);
router.post('/:id/save', verifyToken, saveCourse);
router.delete('/:id/save', verifyToken, unsaveCourse);

module.exports = router;
