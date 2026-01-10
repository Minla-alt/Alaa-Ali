// Import and re-export shared constants for backend use
import { LANGUAGES, CONTENT_CATEGORIES, ERROR_MESSAGES } from '../../../shared/constants.js'

export {
  LANGUAGES,
  CONTENT_CATEGORIES,
  ERROR_MESSAGES
}

// Add backend-specific constants here
export const SERVER_CONSTANTS = {
  DEFAULT_PORT: 5000,
  MAX_REQUEST_SIZE: '10mb',
  RATE_LIMIT: 1000 // requests per hour
}