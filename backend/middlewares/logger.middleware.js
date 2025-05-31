const morgan = require('morgan');
const logger = require('../utils/logger');

// Create a custom Morgan token for request timestamp
morgan.token('timestamp', () => {
  return new Date().toISOString();
});

// Create a custom Morgan format
const morganFormat = ':timestamp :method :url :status :res[content-length] - :response-time ms';

// Create middleware
const loggerMiddleware = morgan(morganFormat, {
  stream: logger.stream,
  skip: (req) => {
    // Skip logging for health check endpoints
    return req.url === '/health' || req.url === '/api/health';
  }
});

// Log all requests
const requestLogger = (req, res, next) => {
  req.time = new Date(Date.now()).toUTCString();
  logger.debug(`${req.method} ${req.originalUrl}`, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  next();
};

module.exports = [loggerMiddleware, requestLogger];