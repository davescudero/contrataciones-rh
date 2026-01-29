/**
 * Centralized logging service
 * 
 * In production, logs are suppressed unless explicitly enabled.
 * In development, all logs are shown.
 * 
 * Future: Can be extended to send logs to external services like Sentry, LogRocket, etc.
 */

const isDev = process.env.NODE_ENV === 'development';
const isLoggingEnabled = isDev || process.env.REACT_APP_ENABLE_LOGGING === 'true';

/**
 * Log levels with colors for console
 */
const LOG_LEVELS = {
  DEBUG: { level: 0, color: '#9CA3AF', label: 'DEBUG' },
  INFO: { level: 1, color: '#3B82F6', label: 'INFO' },
  WARN: { level: 2, color: '#F59E0B', label: 'WARN' },
  ERROR: { level: 3, color: '#EF4444', label: 'ERROR' },
};

/**
 * Current minimum log level (can be configured via env)
 */
const minLevel = isDev ? LOG_LEVELS.DEBUG.level : LOG_LEVELS.WARN.level;

/**
 * Format log message with context
 */
const formatMessage = (level, context, message) => {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level.label}]${context ? ` [${context}]` : ''} ${message}`;
};

/**
 * Main logging function
 */
const log = (level, context, message, data = null) => {
  if (!isLoggingEnabled && level.level < LOG_LEVELS.ERROR.level) return;
  if (level.level < minLevel) return;

  const formattedMessage = formatMessage(level, context, message);

  if (isDev) {
    const style = `color: ${level.color}; font-weight: bold;`;
    if (data) {
      console.groupCollapsed(`%c${formattedMessage}`, style);
      console.log('Data:', data);
      console.groupEnd();
    } else {
      console.log(`%c${formattedMessage}`, style);
    }
  } else {
    // In production, use simple console methods
    switch (level.label) {
      case 'ERROR':
        console.error(formattedMessage, data || '');
        break;
      case 'WARN':
        console.warn(formattedMessage, data || '');
        break;
      default:
        // Suppress in production unless explicitly enabled
        break;
    }
  }

  // Future: Send to external logging service
  // if (level.level >= LOG_LEVELS.ERROR.level) {
  //   sendToExternalService({ level, context, message, data });
  // }
};

/**
 * Logger object with convenience methods
 */
const logger = {
  /**
   * Debug level - only shown in development
   */
  debug: (context, message, data) => log(LOG_LEVELS.DEBUG, context, message, data),

  /**
   * Info level - general information
   */
  info: (context, message, data) => log(LOG_LEVELS.INFO, context, message, data),

  /**
   * Warning level - potential issues
   */
  warn: (context, message, data) => log(LOG_LEVELS.WARN, context, message, data),

  /**
   * Error level - always shown, captures errors
   */
  error: (context, message, data) => log(LOG_LEVELS.ERROR, context, message, data),

  /**
   * Log API/Supabase errors with proper formatting
   */
  apiError: (context, operation, error) => {
    const message = `${operation} failed: ${error?.message || 'Unknown error'}`;
    log(LOG_LEVELS.ERROR, context, message, {
      code: error?.code,
      details: error?.details,
      hint: error?.hint,
      stack: isDev ? error?.stack : undefined,
    });
  },
};

export default logger;
