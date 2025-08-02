const { logEvent } = require('./logger');

const errorMiddleware = (err, req, res, next) => {
  // 1. Create error object with proper inheritance
  const error = {
    ...err,
    message: err.message,
    statusCode: err.statusCode || 500,
    stack: err.stack
  };

  // 2. Enhanced error logging (with timestamp and cleaned data)
  logEvent(
    `[${new Date().toISOString()}] ${err.name}\t${req.method}\t${req.url}\t${req.headers.origin || 'No origin'}\t${err.message.replace(/\t|\n/g, ' ')}\n`,
    'errLog.log'
  );

  // 3. Handle specific error types
  switch (true) {
    case err.name === 'CastError':
      error.message = 'Resource not found';
      error.statusCode = 404;
      break;

    case err.code === 11000:
      error.message = 'Duplicate field value entered';
      error.statusCode = 400;
      break;

    case err.name === 'ValidationError':
      error.fields = Object.values(err.errors).reduce((acc, { path, message }) => {
        acc[path] = message.replace(/Path\s|!|Validation\sfailed:\s?/g, '').trim();
        return acc;
      }, {});
      error.message = 'Validation failed';
      error.statusCode = 400;
      break;

    case err.name === 'JsonWebTokenError':
      error.message = 'Invalid token';
      error.statusCode = 401;
      break;

    case err.name === 'TokenExpiredError':
      error.message = 'Token expired';
      error.statusCode = 401;
      break;
  }

  // 4. Prepare response
  const response = {
    success: false,
    error: error.message,
    ...(error.fields && { fields: error.fields })
  };

  // 5. Only include stack in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = error.stack;
  }

  res.status(error.statusCode).json(response);
};

module.exports = errorMiddleware;