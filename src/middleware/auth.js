const twilioService = require('../services/twilioService');
const logger = require('../config/logger');

/**
 * Validate Twilio webhook signature
 */
function validateTwilioSignature(req, res, next) {
    // Always validate signature in production
    const signature = req.headers['x-twilio-signature'];
    const url = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    
    if (!signature) {
        logger.warn('Missing Twilio signature header');
        return res.status(401).json({ error: 'Unauthorized: Missing signature' });
    }

    try {
        const isValid = twilioService.validateSignature(signature, url, req.body);
        
        if (!isValid) {
            logger.warn('Invalid Twilio signature');
            return res.status(401).json({ error: 'Unauthorized: Invalid signature' });
        }

        logger.debug('Twilio signature validated successfully');
        next();
    } catch (error) {
        logger.error('Error validating Twilio signature:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

/**
 * Basic API key authentication middleware
 */
function validateApiKey(req, res, next) {
    const apiKey = req.headers['x-api-key'] || req.query.apiKey;
    const validApiKey = process.env.API_KEY;

    // Skip if no API key is configured
    if (!validApiKey) {
        return next();
    }

    if (!apiKey || apiKey !== validApiKey) {
        logger.warn('Invalid or missing API key');
        return res.status(401).json({ error: 'Unauthorized: Invalid API key' });
    }

    next();
}

module.exports = {
    validateTwilioSignature,
    validateApiKey
};
