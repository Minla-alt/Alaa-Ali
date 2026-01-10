// Shared TypeScript types (can be used with JSDoc in JavaScript)

/**
 * @typedef {Object} User
 * @property {string} _id - User ID
 * @property {string} username - Username
 * @property {string} email - Email address
 * @property {string} password - Hashed password
 * @property {Date} createdAt - Creation date
 * @property {Date} updatedAt - Last update date
 */

/**
 * @typedef {Object} Content
 * @property {string} _id - Content ID
 * @property {string} title - Content title
 * @property {string} description - Content description
 * @property {'en'|'ar'} language - Content language
 * @property {'lesson'|'quiz'|'article'|'video'} category - Content category
 * @property {string} createdBy - User ID of creator
 * @property {Date} createdAt - Creation date
 * @property {Date} updatedAt - Last update date
 */

/**
 * @typedef {Object} APIResponse
 * @property {boolean} success - Request success status
 * @property {any} data - Response data
 * @property {string} message - Response message
 * @property {number} statusCode - HTTP status code
 */

/**
 * @typedef {Object} AuthResponse
 * @property {User} user - User data
 * @property {string} token - JWT token
 */

export {}