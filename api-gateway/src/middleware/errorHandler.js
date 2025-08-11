const { logEvent } = require('./logger');

const errorMiddleware = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log the error (uncomment and improve)
  logEvent(
    `${err.name}\t${err.message}\t${req.method}\t${req.url}\t${req.headers.origin}\t${err.stack || 'No stack'}`,
    'errLog.log'
  );

  // Mongoose CastError (404)
  if (err.name === 'CastError') {
    error = new Error('Resource not found');
    error.statusCode = 404;
  }

  // Mongoose Duplicate Key (400)
  if (err.code === 11000) {
    error = new Error('Duplicate field value');
    error.statusCode = 400;
  }

  // Mongoose ValidationError (400)
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message.replace('Path ', ''));
    error = new Error(messages.join(', '));
    error.statusCode = 400;
  }

  // JWT Errors (401)
  if (err.name === 'JsonWebTokenError') {
    error = new Error('Invalid token');
    error.statusCode = 401;
  }

  // Default to 500 if no statusCode set
  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

module.exports = errorMiddleware;