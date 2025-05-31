const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const { authenticate } = require('../middlewares/authMiddleware');

// Log endpoint for frontend logs
router.post('/', (req, res) => {
  const { level, message, meta } = req.body;
  
  // Validate required fields
  if (!level || !message) {
    return res.status(400).json({ message: 'Log level and message are required' });
  }
  
  // Map to appropriate log level
  switch (level.toLowerCase()) {
    case 'error':
      logger.error(`[FRONTEND] ${message}`, meta);
      break;
    case 'warn':
      logger.warn(`[FRONTEND] ${message}`, meta);
      break;
    case 'info':
      logger.info(`[FRONTEND] ${message}`, meta);
      break;
    case 'debug':
      logger.debug(`[FRONTEND] ${message}`, meta);
      break;
    default:
      logger.info(`[FRONTEND] ${message}`, meta);
  }
  
  res.status(200).json({ success: true });
});

// Authenticated log endpoint (for user-specific logs)
router.post('/auth', authenticate, (req, res) => {
  const { level, message, meta = {} } = req.body;
  
  // Add user info to meta
  const enhancedMeta = {
    ...meta,
    userId: req.user.id,
    userEmail: req.user.email
  };
  
  // Validate required fields
  if (!level || !message) {
    return res.status(400).json({ message: 'Log level and message are required' });
  }
  
  // Map to appropriate log level
  switch (level.toLowerCase()) {
    case 'error':
      logger.error(`[FRONTEND:AUTH] ${message}`, enhancedMeta);
      break;
    case 'warn':
      logger.warn(`[FRONTEND:AUTH] ${message}`, enhancedMeta);
      break;
    case 'info':
      logger.info(`[FRONTEND:AUTH] ${message}`, enhancedMeta);
      break;
    case 'debug':
      logger.debug(`[FRONTEND:AUTH] ${message}`, enhancedMeta);
      break;
    default:
      logger.info(`[FRONTEND:AUTH] ${message}`, enhancedMeta);
  }
  
  res.status(200).json({ success: true });
});

module.exports = router; 