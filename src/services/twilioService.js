const twilio = require('twilio');
const logger = require('../config/logger');

class TwilioService {
    constructor() {
        // Validate required environment variables
        if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
            throw new Error('Missing required Twilio environment variables. Please check TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER.');
        }

        this.client = twilio(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_AUTH_TOKEN
        );
        this.fromNumber = process.env.TWILIO_PHONE_NUMBER;
        
        logger.info('Twilio service initialized successfully');
    }
    /**
     * Send a WhatsApp message
     * @param {string} to - Recipient phone number
     * @param {string} message - Message content
     * @param {Object} options - Additional options (media, etc.)
     */
    async sendMessage(to, message, options = {}) {
        try {
            const messageData = {
                from: `whatsapp:${this.fromNumber}`,
                to: `whatsapp:${to}`,
                body: message,
                ...options
            };

            const result = await this.client.messages.create(messageData);
            
            logger.info(`Message sent to ${to}: ${result.sid}`);
            return result;
        } catch (error) {
            logger.error(`Failed to send message to ${to}:`, error);
            throw error;
        }
    }

    /**
     * Send a WhatsApp message with media
     * @param {string} to - Recipient phone number
     * @param {string} message - Message content
     * @param {string} mediaUrl - URL of media to send
     */
    async sendMessageWithMedia(to, message, mediaUrl) {
        return this.sendMessage(to, message, {
            mediaUrl: [mediaUrl]
        });
    }

    /**
     * Send a typing indicator
     * @param {string} to - Recipient phone number
     */
    async sendTypingIndicator(to) {
        try {
            // Twilio doesn't have a direct typing indicator for WhatsApp
            // This is a placeholder for future implementation
            logger.debug(`Sending typing indicator to ${to}`);
        } catch (error) {
            logger.error(`Failed to send typing indicator to ${to}:`, error);
        }
    }

    /**
     * Format phone number for WhatsApp
     * @param {string} phoneNumber - Raw phone number
     * @returns {string} Formatted phone number
     */
    formatPhoneNumber(phoneNumber) {
        // Remove 'whatsapp:' prefix if present
        const cleaned = phoneNumber.replace('whatsapp:', '');
        
        // Ensure it starts with '+'
        if (!cleaned.startsWith('+')) {
            return `+${cleaned}`;
        }
        
        return cleaned;
    }

    /**
     * Validate Twilio webhook signature
     * @param {string} signature - Twilio signature
     * @param {string} url - Webhook URL
     * @param {Object} params - Request parameters
     * @returns {boolean} Is signature valid
     */
    validateSignature(signature, url, params) {
        try {
            if (!this.isEnabled) {
                logger.debug('[TEST MODE] Skipping Twilio signature validation');
                return true;
            }
            
            return twilio.validateRequest(
                process.env.TWILIO_AUTH_TOKEN,
                signature,
                url,
                params
            );
        } catch (error) {
            logger.error('Error validating Twilio signature:', error);
            return false;
        }
    }
}

module.exports = new TwilioService();
