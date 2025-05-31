import log from 'loglevel';
import api from '../lib/api';

// Set the default log level based on environment
const logLevel = import.meta.env.MODE === 'production' ? 'warn' : 'debug';
log.setLevel(logLevel);

// Original console methods
const originalConsole = {
  log: console.log,
  info: console.info,
  warn: console.warn,
  error: console.error,
  debug: console.debug
};

// Create a custom log format with timestamp
const formatLogMessage = (level, ...args) => {
  const timestamp = new Date().toISOString();
  return [`[${timestamp}] [${level.toUpperCase()}]`, ...args];
};

// Function to send logs to server
const sendLogToServer = async (level, message, meta = {}) => {
  try {
    // Don't send debug logs to server in production
    if (import.meta.env.MODE === 'production' && level === 'debug') {
      return;
    }
    
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    const endpoint = token ? '/api/logs/auth' : '/api/logs';
    
    // Don't await to avoid blocking
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({
        level,
        message: typeof message === 'string' ? message : JSON.stringify(message),
        meta: {
          ...meta,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        }
      }),
      // Use keepalive to ensure the request is sent even if the page is unloading
      keepalive: true
    }).catch(err => {
      // Use original console to avoid infinite loops
      originalConsole.error('Failed to send log to server:', err);
    });
  } catch (error) {
    // Use original console to avoid infinite loops
    originalConsole.error('Error in sendLogToServer:', error);
  }
};

// Custom logger that extends loglevel
const logger = {
  debug: (...args) => {
    const formattedArgs = formatLogMessage('debug', ...args);
    log.debug(...formattedArgs);
    
    // Extract message from args
    const message = args[0] || '';
    const meta = args.length > 1 ? { additionalArgs: args.slice(1) } : {};
    
    // Only log to server in development
    if (import.meta.env.MODE === 'development') {
      sendLogToServer('debug', message, meta);
    }
  },
  
  info: (...args) => {
    const formattedArgs = formatLogMessage('info', ...args);
    log.info(...formattedArgs);
    
    // Extract message from args
    const message = args[0] || '';
    const meta = args.length > 1 ? { additionalArgs: args.slice(1) } : {};
    
    sendLogToServer('info', message, meta);
  },
  
  warn: (...args) => {
    const formattedArgs = formatLogMessage('warn', ...args);
    log.warn(...formattedArgs);
    
    // Extract message from args
    const message = args[0] || '';
    const meta = args.length > 1 ? { additionalArgs: args.slice(1) } : {};
    
    sendLogToServer('warn', message, meta);
  },
  
  error: (...args) => {
    const formattedArgs = formatLogMessage('error', ...args);
    log.error(...formattedArgs);
    
    // Extract message and error from args
    const message = args[0] || '';
    let meta = {};
    
    // Check if the second argument is an Error object
    if (args.length > 1 && args[1] instanceof Error) {
      const error = args[1];
      meta = {
        errorMessage: error.message,
        stack: error.stack,
        ...meta
      };
    } else if (args.length > 1) {
      meta = { additionalArgs: args.slice(1) };
    }
    
    sendLogToServer('error', message, meta);
  }
};

// Override console methods to use our logger
if (import.meta.env.MODE !== 'test') {
  console.log = logger.info;
  console.info = logger.info;
  console.warn = logger.warn;
  console.error = logger.error;
  console.debug = logger.debug;
}

// Add global error handling
window.addEventListener('error', (event) => {
  logger.error('Uncaught error', {
    message: event.error?.message || 'Unknown error',
    stack: event.error?.stack,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno
  });
});

window.addEventListener('unhandledrejection', (event) => {
  logger.error('Unhandled promise rejection', {
    message: event.reason?.message || 'Unknown rejection reason',
    stack: event.reason?.stack,
    reason: event.reason
  });
});

export default logger; 