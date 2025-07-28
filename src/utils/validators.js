const logger = require('../config/logger');

class Validators {
    /**
     * Validate Ethereum address format
     * @param {string} address - Address to validate
     * @returns {Object} Validation result
     */
    static validateAddress(address) {
        const result = {
            isValid: false,
            error: null,
            formatted: null
        };

        if (!address) {
            result.error = 'Address is required';
            return result;
        }

        if (typeof address !== 'string') {
            result.error = 'Address must be a string';
            return result;
        }

        // Remove whitespace
        const cleanAddress = address.trim();

        // Check format
        if (!/^0x[a-fA-F0-9]{40}$/.test(cleanAddress)) {
            result.error = 'Invalid address format. Must be 42 characters starting with 0x';
            return result;
        }

        result.isValid = true;
        result.formatted = cleanAddress.toLowerCase();
        return result;
    }

    /**
     * Validate transaction hash format
     * @param {string} hash - Hash to validate
     * @returns {Object} Validation result
     */
    static validateTransactionHash(hash) {
        const result = {
            isValid: false,
            error: null,
            formatted: null
        };

        if (!hash) {
            result.error = 'Transaction hash is required';
            return result;
        }

        if (typeof hash !== 'string') {
            result.error = 'Transaction hash must be a string';
            return result;
        }

        // Remove whitespace
        const cleanHash = hash.trim();

        // Check format
        if (!/^0x[a-fA-F0-9]{64}$/.test(cleanHash)) {
            result.error = 'Invalid transaction hash format. Must be 66 characters starting with 0x';
            return result;
        }

        result.isValid = true;
        result.formatted = cleanHash.toLowerCase();
        return result;
    }

    /**
     * Validate blockchain name
     * @param {string} chain - Blockchain name
     * @returns {Object} Validation result
     */
    static validateChain(chain) {
        const result = {
            isValid: false,
            error: null,
            formatted: null
        };

        const supportedChains = ['ethereum', 'polygon'];

        if (!chain) {
            result.isValid = true;
            result.formatted = 'ethereum'; // Default
            return result;
        }

        if (typeof chain !== 'string') {
            result.error = 'Chain must be a string';
            return result;
        }

        const normalizedChain = chain.toLowerCase().trim();

        // Handle common aliases
        const chainAliases = {
            'eth': 'ethereum',
            'matic': 'polygon',
            'poly': 'polygon'
        };

        const finalChain = chainAliases[normalizedChain] || normalizedChain;

        if (!supportedChains.includes(finalChain)) {
            result.error = `Unsupported chain: ${chain}. Supported chains: ${supportedChains.join(', ')}`;
            return result;
        }

        result.isValid = true;
        result.formatted = finalChain;
        return result;
    }

    /**
     * Validate token ID
     * @param {string|number} tokenId - Token ID to validate
     * @returns {Object} Validation result
     */
    static validateTokenId(tokenId) {
        const result = {
            isValid: false,
            error: null,
            formatted: null
        };

        if (!tokenId && tokenId !== 0) {
            result.error = 'Token ID is required';
            return result;
        }

        // Convert to string for validation
        const tokenIdStr = String(tokenId).trim();

        // Check if it's a valid positive integer
        if (!/^\d+$/.test(tokenIdStr)) {
            result.error = 'Token ID must be a positive integer';
            return result;
        }

        const tokenIdNum = parseInt(tokenIdStr, 10);

        if (tokenIdNum < 0) {
            result.error = 'Token ID must be non-negative';
            return result;
        }

        if (tokenIdNum > Number.MAX_SAFE_INTEGER) {
            result.error = 'Token ID is too large';
            return result;
        }

        result.isValid = true;
        result.formatted = tokenIdStr;
        return result;
    }

    /**
     * Validate token symbol or address
     * @param {string} token - Token symbol or address
     * @returns {Object} Validation result
     */
    static validateToken(token) {
        const result = {
            isValid: false,
            error: null,
            formatted: null,
            type: null // 'address' or 'symbol'
        };

        if (!token) {
            result.error = 'Token symbol or address is required';
            return result;
        }

        if (typeof token !== 'string') {
            result.error = 'Token must be a string';
            return result;
        }

        const cleanToken = token.trim();

        // Check if it's an address
        if (cleanToken.startsWith('0x')) {
            const addressValidation = this.validateAddress(cleanToken);
            if (addressValidation.isValid) {
                result.isValid = true;
                result.formatted = addressValidation.formatted;
                result.type = 'address';
                return result;
            } else {
                result.error = addressValidation.error;
                return result;
            }
        }

        // Treat as symbol
        if (!/^[A-Z]{1,10}$/i.test(cleanToken)) {
            result.error = 'Token symbol must be 1-10 letters only';
            return result;
        }

        result.isValid = true;
        result.formatted = cleanToken.toUpperCase();
        result.type = 'symbol';
        return result;
    }

    /**
     * Validate phone number format
     * @param {string} phoneNumber - Phone number to validate
     * @returns {Object} Validation result
     */
    static validatePhoneNumber(phoneNumber) {
        const result = {
            isValid: false,
            error: null,
            formatted: null
        };

        if (!phoneNumber) {
            result.error = 'Phone number is required';
            return result;
        }

        if (typeof phoneNumber !== 'string') {
            result.error = 'Phone number must be a string';
            return result;
        }

        // Remove whatsapp: prefix if present
        let cleanNumber = phoneNumber.replace('whatsapp:', '').trim();

        // Ensure it starts with +
        if (!cleanNumber.startsWith('+')) {
            cleanNumber = '+' + cleanNumber;
        }

        // Basic international phone number format validation
        if (!/^\+[1-9]\d{1,14}$/.test(cleanNumber)) {
            result.error = 'Invalid phone number format. Must be in international format (+1234567890)';
            return result;
        }

        result.isValid = true;
        result.formatted = cleanNumber;
        return result;
    }

    /**
     * Validate API key format
     * @param {string} apiKey - API key to validate
     * @returns {Object} Validation result
     */
    static validateApiKey(apiKey) {
        const result = {
            isValid: false,
            error: null
        };

        if (!apiKey) {
            result.error = 'API key is required';
            return result;
        }

        if (typeof apiKey !== 'string') {
            result.error = 'API key must be a string';
            return result;
        }

        const cleanApiKey = apiKey.trim();

        if (cleanApiKey.length < 10) {
            result.error = 'API key is too short';
            return result;
        }

        if (cleanApiKey.length > 200) {
            result.error = 'API key is too long';
            return result;
        }

        result.isValid = true;
        return result;
    }

    /**
     * Validate message content
     * @param {string} message - Message to validate
     * @returns {Object} Validation result
     */
    static validateMessage(message) {
        const result = {
            isValid: false,
            error: null,
            formatted: null
        };

        if (!message) {
            result.error = 'Message is required';
            return result;
        }

        if (typeof message !== 'string') {
            result.error = 'Message must be a string';
            return result;
        }

        const cleanMessage = message.trim();

        if (cleanMessage.length === 0) {
            result.error = 'Message cannot be empty';
            return result;
        }

        if (cleanMessage.length > 4000) {
            result.error = 'Message is too long (max 4000 characters)';
            return result;
        }

        result.isValid = true;
        result.formatted = cleanMessage;
        return result;
    }

    /**
     * Validate numeric value
     * @param {string|number} value - Value to validate
     * @param {Object} options - Validation options
     * @returns {Object} Validation result
     */
    static validateNumber(value, options = {}) {
        const {
            min = null,
            max = null,
            allowDecimals = true,
            name = 'Number'
        } = options;

        const result = {
            isValid: false,
            error: null,
            formatted: null
        };

        if (value === null || value === undefined || value === '') {
            result.error = `${name} is required`;
            return result;
        }

        const numValue = Number(value);

        if (isNaN(numValue)) {
            result.error = `${name} must be a valid number`;
            return result;
        }

        if (!allowDecimals && !Number.isInteger(numValue)) {
            result.error = `${name} must be an integer`;
            return result;
        }

        if (min !== null && numValue < min) {
            result.error = `${name} must be at least ${min}`;
            return result;
        }

        if (max !== null && numValue > max) {
            result.error = `${name} must be at most ${max}`;
            return result;
        }

        result.isValid = true;
        result.formatted = numValue;
        return result;
    }

    /**
     * Validate environment configuration
     * @param {Object} config - Environment configuration
     * @returns {Object} Validation result
     */
    static validateEnvironmentConfig(config = process.env) {
        const errors = [];
        const warnings = [];

        // Required environment variables
        const required = [
            'TWILIO_ACCOUNT_SID',
            'TWILIO_AUTH_TOKEN',
            'TWILIO_PHONE_NUMBER',
            'NODIT_API_KEY'
        ];

        required.forEach(key => {
            if (!config[key]) {
                errors.push(`Missing required environment variable: ${key}`);
            }
        });

        // Optional but recommended
        const recommended = [
            'OPENAI_API_KEY',
            'WEBHOOK_URL'
        ];

        recommended.forEach(key => {
            if (!config[key]) {
                warnings.push(`Missing recommended environment variable: ${key}`);
            }
        });

        // Validate specific formats
        if (config.TWILIO_PHONE_NUMBER) {
            const phoneValidation = this.validatePhoneNumber(config.TWILIO_PHONE_NUMBER);
            if (!phoneValidation.isValid) {
                errors.push(`Invalid TWILIO_PHONE_NUMBER: ${phoneValidation.error}`);
            }
        }

        if (config.PORT) {
            const portValidation = this.validateNumber(config.PORT, {
                min: 1,
                max: 65535,
                allowDecimals: false,
                name: 'PORT'
            });
            if (!portValidation.isValid) {
                errors.push(`Invalid PORT: ${portValidation.error}`);
            }
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }
}

module.exports = Validators;
