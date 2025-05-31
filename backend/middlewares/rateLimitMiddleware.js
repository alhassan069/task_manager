const rateLimit = require('express-rate-limit');

/**
 * Rate limiter for NLP API endpoints
 * Limits requests to 10 per minute per IP
 */
const nlpRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: 'Too many requests, please try again after a minute',
  },
  keyGenerator: (req) => {
    // Use user ID for rate limiting if available, otherwise use IP
    return req.user ? req.user.id : req.ip;
  },
});

module.exports = {
  nlpRateLimiter,
}; 