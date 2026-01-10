// Error handling utilities

/**
 * Format error response
 * @param {Error} error - Error object
 * @param {string} message - Custom error message
 * @returns {Object} Formatted error response
 */
export const formatError = (error, message = 'Something went wrong') => {
  console.error('Error:', error)
  
  return {
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    statusCode: 500
  }
}

/**
 * Handle validation errors
 * @param {Error} error - Validation error
 * @returns {Object} Validation error response
 */
export const handleValidationError = (error) => {
  const errors = []
  
  if (error.name === 'ValidationError') {
    for (const field in error.errors) {
      errors.push(error.errors[field].message)
    }
  }
  
  return {
    success: false,
    message: 'Validation failed',
    errors,
    statusCode: 400
  }
}