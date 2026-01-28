/**
 * Error Handler Middleware
 * 
 * Centralized error handling for the MAITRI API
 */

/**
 * Global error handler middleware
 * @param {Error} err - The error object
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} next - Next middleware function
 */
export function errorHandler(err, req, res, next) {
  console.error('❌ Error:', err.message);
  
  // Log stack trace in development
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  // Handle specific error types
  if (err.name === 'GoogleGenerativeAIError' || err.message?.includes('API key')) {
    return res.status(500).json({
      error: 'AI service error',
      message: 'There was an issue with the AI service. Please try again later.',
    });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation error',
      message: err.message,
    });
  }

  // Handle rate limiting errors from Gemini API
  if (err.message?.includes('429') || err.message?.includes('quota')) {
    return res.status(429).json({
      error: 'Rate limit exceeded',
      message: 'Too many requests. Please wait a moment and try again.',
    });
  }

  // Default error response
  res.status(err.statusCode || 500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' 
      ? err.message 
      : 'Something went wrong. Please try again later.',
  });
}

/**
 * 404 Not Found handler
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export function notFoundHandler(req, res) {
  res.status(404).json({
    error: 'Not found',
    message: `The requested endpoint ${req.method} ${req.path} does not exist`,
  });
}

export default { errorHandler, notFoundHandler };
