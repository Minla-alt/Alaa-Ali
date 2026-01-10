import express from 'express'
import { getContent, createContent } from '../controllers/contentController.js'
import { authenticate } from '../middleware/authMiddleware.js'

const router = express.Router()

// Content routes
router.get('/', getContent)
router.post('/', authenticate, createContent)

export default router