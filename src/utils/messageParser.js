const logger = require('../config/logger');

class MessageParser {
    /**
     * Extract wallet addresses from message
     * @param {string} message - User message
     * @returns {Array} Array of wallet addresses
     */
    static extractAddresses(message) {
        const addressRegex = /0x[a-fA-F0-9]{40}/g;
        return message.match(addressRegex) || [];
    }

    /**
     * Extract transaction hashes from message
     * @param {string} message - User message
     * @returns {Array} Array of transaction hashes
     */
    static extractTransactionHashes(message) {
        const txRegex = /0x[a-fA-F0-9]{64}/g;
        return message.match(txRegex) || [];
    }

    /**
     * Extract token IDs from message (numbers after #)
     * @param {string} message - User message
     * @returns {Array} Array of token IDs
     */
    static extractTokenIds(message) {
        const tokenIdRegex = /#(\d+)/g;
        const matches = [];
        let match;
        
        while ((match = tokenIdRegex.exec(message)) !== null) {
            matches.push(match[1]);
        }
        
        return matches;
    }

    /**
     * Extract token symbols from message
     * @param {string} message - User message
     * @returns {Array} Array of potential token symbols
     */
    static extractTokenSymbols(message) {
        // Look for uppercase words that could be token symbols (2-6 characters)
        const symbolRegex = /\b([A-Z]{2,6})\b/g;
        const matches = [];
        let match;
        
        while ((match = symbolRegex.exec(message)) !== null) {
            matches.push(match[1]);
        }
        
        return matches;
    }

    /**
     * Detect blockchain mentions
     * @param {string} message - User message
     * @returns {string} Detected blockchain or default
     */
    static detectBlockchain(message) {
        const lowercaseMessage = message.toLowerCase();
        
        if (lowercaseMessage.includes('polygon') || lowercaseMessage.includes('matic')) {
            return 'polygon';
        } else if (lowercaseMessage.includes('ethereum') || lowercaseMessage.includes('eth')) {
            return 'ethereum';
        }
        
        return 'ethereum'; // Default
    }

    /**
     * Extract numeric values from message
     * @param {string} message - User message
     * @returns {Array} Array of numeric values
     */
    static extractNumbers(message) {
        const numberRegex = /\b\d+(\.\d+)?\b/g;
        return message.match(numberRegex) || [];
    }

    /**
     * Clean and normalize message
     * @param {string} message - Raw message
     * @returns {string} Cleaned message
     */
    static cleanMessage(message) {
        if (!message) return '';
        
        return message
            .trim()
            .replace(/\s+/g, ' ') // Multiple spaces to single space
            .replace(/[^\w\s0-9#.+\-]/g, ' ') // Remove special chars except # . + -
            .trim();
    }

    /**
     * Detect message intent based on keywords
     * @param {string} message - User message
     * @returns {string} Detected intent
     */
    static detectIntent(message) {
        const lowercaseMessage = message.toLowerCase();
        
        // Intent detection patterns
        const patterns = {
            wallet_balance: [
                'balance', 'wallet', 'funds', 'money', 'eth balance', 'how much'
            ],
            token_info: [
                'token info', 'what is', 'tell me about', 'information about', 'details about'
            ],
            price_query: [
                'price', 'cost', 'value', 'worth', 'how much is', 'current price'
            ],
            nft_details: [
                'nft', 'non-fungible', 'collectible', 'art piece', 'nft details'
            ],
            transaction_details: [
                'transaction', 'tx', 'transfer', 'send', 'receipt', 'tx details'
            ],
            help: [
                'help', 'commands', 'what can you do', 'how to use', 'instructions'
            ]
        };

        // Check each pattern
        for (const [intent, keywords] of Object.entries(patterns)) {
            for (const keyword of keywords) {
                if (lowercaseMessage.includes(keyword)) {
                    return intent;
                }
            }
        }

        return 'help'; // Default intent
    }

    /**
     * Parse complete message and extract all relevant information
     * @param {string} message - User message
     * @returns {Object} Parsed message data
     */
    static parseMessage(message) {
        try {
            const cleanedMessage = this.cleanMessage(message);
            
            const parsed = {
                original: message,
                cleaned: cleanedMessage,
                intent: this.detectIntent(cleanedMessage),
                addresses: this.extractAddresses(message),
                transactionHashes: this.extractTransactionHashes(message),
                tokenIds: this.extractTokenIds(message),
                tokenSymbols: this.extractTokenSymbols(cleanedMessage),
                blockchain: this.detectBlockchain(cleanedMessage),
                numbers: this.extractNumbers(cleanedMessage)
            };

            logger.debug('Parsed message:', parsed);
            return parsed;
        } catch (error) {
            logger.error('Error parsing message:', error);
            return {
                original: message,
                cleaned: message,
                intent: 'help',
                addresses: [],
                transactionHashes: [],
                tokenIds: [],
                tokenSymbols: [],
                blockchain: 'ethereum',
                numbers: []
            };
        }
    }

    /**
     * Validate extracted data
     * @param {Object} parsedData - Parsed message data
     * @returns {Object} Validation results
     */
    static validateParsedData(parsedData) {
        const validation = {
            isValid: true,
            errors: [],
            warnings: []
        };

        // Validate addresses
        parsedData.addresses.forEach(address => {
            if (!this.isValidAddress(address)) {
                validation.errors.push(`Invalid address format: ${address}`);
                validation.isValid = false;
            }
        });

        // Validate transaction hashes
        parsedData.transactionHashes.forEach(hash => {
            if (!this.isValidTransactionHash(hash)) {
                validation.errors.push(`Invalid transaction hash format: ${hash}`);
                validation.isValid = false;
            }
        });

        // Check for required data based on intent
        switch (parsedData.intent) {
            case 'wallet_balance':
                if (parsedData.addresses.length === 0) {
                    validation.errors.push('Wallet address required for balance query');
                    validation.isValid = false;
                }
                break;
            
            case 'nft_details':
                if (parsedData.addresses.length === 0 || parsedData.tokenIds.length === 0) {
                    validation.warnings.push('NFT queries require both contract address and token ID');
                }
                break;
            
            case 'transaction_details':
                if (parsedData.transactionHashes.length === 0) {
                    validation.errors.push('Transaction hash required for transaction details');
                    validation.isValid = false;
                }
                break;
        }

        return validation;
    }

    /**
     * Validate Ethereum address format
     * @param {string} address - Address to validate
     * @returns {boolean} Is valid address
     */
    static isValidAddress(address) {
        return /^0x[a-fA-F0-9]{40}$/.test(address);
    }

    /**
     * Validate transaction hash format
     * @param {string} hash - Hash to validate
     * @returns {boolean} Is valid hash
     */
    static isValidTransactionHash(hash) {
        return /^0x[a-fA-F0-9]{64}$/.test(hash);
    }
}

module.exports = MessageParser;
