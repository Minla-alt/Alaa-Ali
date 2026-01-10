import express from 'express'
import { generateContent, translateContent } from '../controllers/aiController.js'
import { authenticate } from '../middleware/authMiddleware.js'

const router = express.Router()

// AI routes
router.post('/generate', authenticate, generateContent)
router.post('/translate', authenticate, translateContent)

export default router