// Import and re-export shared constants for frontend use
import { LANGUAGES, CONTENT_CATEGORIES } from '../../../shared/constants.js'

export {
  LANGUAGES,
  CONTENT_CATEGORIES
}

// Add frontend-specific constants here
export const FRONTEND_CONSTANTS = {
  DEFAULT_LANGUAGE: LANGUAGES.EN,
  SUPPORTED_LANGUAGES: [LANGUAGES.EN, LANGUAGES.AR],
  APP_NAME: 'Bilingual Educational Platform'
}