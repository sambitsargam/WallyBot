const logger = require('../config/logger');

// In-memory store for rate limiting (use Redis in production)
const requestCounts = new Map();
const blockedUsers = new Map();

/**
 * Rate limiting middleware
 */
function rateLimiter(req, res, next) {
    const clientId = getClientIdentifier(req);
    const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000; // 15 minutes
    const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100;
    const blockDurationMs = 300000; // 5 minutes block duration
    
    const now = Date.now();
    
    // Check if user is currently blocked
    if (blockedUsers.has(clientId)) {
        const blockInfo = blockedUsers.get(clientId);
        if (now < blockInfo.until) {
            const remainingTime = Math.ceil((blockInfo.until - now) / 1000);
            logger.warn(`Blocked request from ${clientId}, ${remainingTime}s remaining`);
            return res.status(429).json({
                error: 'Too many requests',
                message: `You are temporarily blocked. Try again in ${remainingTime} seconds.`,
                retryAfter: remainingTime
            });
        } else {
            // Block period expired, remove from blocked list
            blockedUsers.delete(clientId);
        }
    }
    
    // Get current request count for this client
    const clientData = requestCounts.get(clientId) || { count: 0, firstRequest: now };
    
    // Reset count if window has expired
    if (now - clientData.firstRequest > windowMs) {
        clientData.count = 0;
        clientData.firstRequest = now;
    }
    
    // Increment request count
    clientData.count++;
    requestCounts.set(clientId, clientData);
    
    // Check if limit exceeded
    if (clientData.count > maxRequests) {
        // Block the user
        blockedUsers.set(clientId, { until: now + blockDurationMs });
        
        logger.warn(`Rate limit exceeded for ${clientId}, blocking for ${blockDurationMs/1000}s`);
        
        return res.status(429).json({
            error: 'Rate limit exceeded',
            message: `Too many requests. You are now blocked for ${blockDurationMs/1000} seconds.`,
            retryAfter: blockDurationMs / 1000
        });
    }
    
    // Add rate limit headers
    res.set({
        'X-RateLimit-Limit': maxRequests,
        'X-RateLimit-Remaining': Math.max(0, maxRequests - clientData.count),
        'X-RateLimit-Reset': new Date(clientData.firstRequest + windowMs).toISOString()
    });
    
    // Log rate limit info for monitoring
    if (clientData.count % 10 === 0) {
        logger.info(`Rate limit status for ${clientId}: ${clientData.count}/${maxRequests} requests`);
    }
    
    next();
}

/**
 * Get client identifier for rate limiting
 */
function getClientIdentifier(req) {
    // For WhatsApp, use the phone number from Twilio
    if (req.body && req.body.From) {
        return req.body.From.replace('whatsapp:', '');
    }
    
    // Fallback to IP address
    return req.ip || req.connection.remoteAddress || 'unknown';
}

/**
 * Cleanup old entries periodically
 */
function cleanupRateLimitData() {
    const now = Date.now();
    const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000;
    
    // Clean up request counts
    for (const [clientId, data] of requestCounts.entries()) {
        if (now - data.firstRequest > windowMs * 2) {
            requestCounts.delete(clientId);
        }
    }
    
    // Clean up blocked users
    for (const [clientId, blockInfo] of blockedUsers.entries()) {
        if (now > blockInfo.until) {
            blockedUsers.delete(clientId);
        }
    }
    
    logger.debug(`Rate limit cleanup: ${requestCounts.size} active clients, ${blockedUsers.size} blocked`);
}

// Run cleanup every 5 minutes
setInterval(cleanupRateLimitData, 300000);

module.exports = rateLimiter;
