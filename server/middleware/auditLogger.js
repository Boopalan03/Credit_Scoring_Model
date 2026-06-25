const AuditLog = require('../models/AuditLog');

/**
 * Middleware that logs API access to the AuditLog collection.
 * Attaches to all routes that need compliance tracking.
 */
const auditLogger = (action) => {
  return async (req, res, next) => {
    // Capture the original end method
    const originalEnd = res.end;
    const startTime = Date.now();

    res.end = function (...args) {
      const duration = Date.now() - startTime;

      // Log asynchronously — don't block the response
      const logEntry = {
        userId: req.user?._id || null,
        action: action || `${req.method} ${req.originalUrl}`,
        endpoint: req.originalUrl,
        method: req.method,
        ipAddress: req.ip || req.connection?.remoteAddress || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
        statusCode: res.statusCode,
        duration,
        details: {
          query: req.query,
          // Only log non-sensitive body fields
          bodyKeys: req.body ? Object.keys(req.body) : [],
        },
      };

      AuditLog.create(logEntry).catch((err) => {
        console.error('Audit log write failed:', err.message);
      });

      originalEnd.apply(res, args);
    };

    next();
  };
};

/**
 * Global audit middleware — logs all API requests.
 * Lighter than the action-specific version.
 */
const globalAuditLogger = async (req, res, next) => {
  const startTime = Date.now();
  const originalEnd = res.end;

  res.end = function (...args) {
    const duration = Date.now() - startTime;

    // Only audit authenticated requests and write operations
    if (req.user || ['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
      const logEntry = {
        userId: req.user?._id || null,
        action: `${req.method} ${req.route?.path || req.originalUrl}`,
        endpoint: req.originalUrl,
        method: req.method,
        ipAddress: req.ip || req.connection?.remoteAddress || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
        statusCode: res.statusCode,
        duration,
      };

      AuditLog.create(logEntry).catch((err) => {
        console.error('Audit log write failed:', err.message);
      });
    }

    originalEnd.apply(res, args);
  };

  next();
};

module.exports = { auditLogger, globalAuditLogger };
