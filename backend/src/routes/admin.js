const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const Book = require('../models/Book');
const { verifyToken } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/requireAdmin');

const models = { courses: Course, books: Book };
const FIELDS = {
  courses: ['title', 'description', 'subject', 'educationLevel', 'language', 'source', 'sourceUrl', 'order', 'isActive', 'duration', 'tags', 'thumbnail'],
  books: ['title', 'author', 'description', 'subject', 'educationLevel', 'language', 'source', 'sourceUrl', 'order', 'isActive', 'tags', 'thumbnail']
};

router.use(verifyToken, requireAdmin);

router.param('type', (req, res, next, type) => {
  if (!models[type]) {
    return res.status(404).json({ success: false, message: 'Unknown content type' });
  }
  req.Model = models[type];
  req.fields = FIELDS[type];
  next();
});

const pick = (body, fields) => {
  const out = {};
  fields.forEach((f) => { if (body[f] !== undefined) out[f] = body[f]; });
  return out;
};

const fail = (res, error) => {
  if (error.name === 'ValidationError') {
    return res.status(400).json({ success: false, message: Object.values(error.errors).map((e) => e.message).join('; ') });
  }
  if (error.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'Invalid id' });
  }
  console.error('Admin error:', error);
  return res.status(500).json({ success: false, message: 'Server error' });
};

// List everything, including hidden items
router.get('/:type', async (req, res) => {
  try {
    const items = await req.Model.find({}).sort({ order: 1, createdAt: -1 }).limit(500).lean();
    res.json({ success: true, items });
  } catch (e) { fail(res, e); }
});

router.post('/:type', async (req, res) => {
  try {
    const item = await req.Model.create(pick(req.body, req.fields));
    res.status(201).json({ success: true, item });
  } catch (e) { fail(res, e); }
});

router.put('/:type/:id', async (req, res) => {
  try {
    const item = await req.Model.findByIdAndUpdate(req.params.id, { $set: pick(req.body, req.fields) }, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, item });
  } catch (e) { fail(res, e); }
});

router.delete('/:type/:id', async (req, res) => {
  try {
    const item = await req.Model.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true });
  } catch (e) { fail(res, e); }
});

module.exports = router;
