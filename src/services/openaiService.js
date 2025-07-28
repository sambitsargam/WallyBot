const OpenAI = require('openai');
const logger = require('../config/logger');

class OpenAIService {
    constructor() {
        this.client = null;
        this.isEnabled = !!process.env.OPENAI_API_KEY;
        
        if (this.isEnabled) {
            this.client = new OpenAI({
                apiKey: process.env.OPENAI_API_KEY
            });
        }
    }

    /**
     * Parse user message and extract intent
     * @param {string} message - User message
     * @returns {Object} Parsed intent and parameters
     */
    async parseUserIntent(message) {
        if (!this.isEnabled) {
            return this.fallbackParser(message);
        }

        try {
            const completion = await this.client.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: `You are a Web3 assistant parser. Analyze user messages and extract:
                        1. Intent (wallet_balance, token_info, nft_details, price_query, transaction_details, help)
                        2. Parameters (addresses, token symbols, chain, etc.)
                        
                        Respond with JSON only:
                        {
                            "intent": "intent_name",
                            "parameters": {
                                "address": "0x...",
                                "chain": "ethereum|polygon",
                                "token": "symbol_or_address",
                                "tokenId": "number",
                                "query": "search_query"
                            },
                            "confidence": 0.95
                        }`
                    },
                    {
                        role: 'user',
                        content: message
                    }
                ],
                temperature: 0.1,
                max_tokens: 200
            });

            const result = JSON.parse(completion.choices[0].message.content);
            logger.info(`Parsed intent: ${result.intent} (confidence: ${result.confidence})`);
            return result;
        } catch (error) {
            logger.error('OpenAI parsing failed, using fallback:', error);
            return this.fallbackParser(message);
        }
    }

    /**
     * Generate a human-friendly response
     * @param {Object} data - Web3 data to format
     * @param {string} intent - Original intent
     * @returns {string} Formatted response
     */
    async generateResponse(data, intent) {
        if (!this.isEnabled) {
            return this.fallbackFormatter(data, intent);
        }

        try {
            const completion = await this.client.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: `You are WallyBot, a friendly WhatsApp Web3 assistant. 
                        Format Web3 data into clear, concise WhatsApp messages.
                        Use emojis appropriately. Keep responses under 1000 characters.
                        Be helpful and informative but casual.`
                    },
                    {
                        role: 'user',
                        content: `Format this Web3 data for intent "${intent}":\n${JSON.stringify(data, null, 2)}`
                    }
                ],
                temperature: 0.7,
                max_tokens: 300
            });

            const response = completion.choices[0].message.content;
            logger.info(`Generated AI response for intent: ${intent}`);
            return response;
        } catch (error) {
            logger.error('OpenAI response generation failed, using fallback:', error);
            return this.fallbackFormatter(data, intent);
        }
    }

    /**
     * Fallback parser when OpenAI is not available
     * @param {string} message - User message
     * @returns {Object} Parsed intent
     */
    fallbackParser(message) {
        const lowercaseMessage = message.toLowerCase();
        
        // Extract addresses (0x followed by 40 hex characters)
        const addressMatch = message.match(/0x[a-fA-F0-9]{40}/);
        const address = addressMatch ? addressMatch[0] : null;
        
        // Extract token IDs (numbers after #)
        const tokenIdMatch = message.match(/#(\d+)/);
        const tokenId = tokenIdMatch ? tokenIdMatch[1] : null;
        
        // Extract chain mentions
        let chain = 'ethereum';
        if (lowercaseMessage.includes('polygon') || lowercaseMessage.includes('matic')) {
            chain = 'polygon';
        }
        
        // Determine intent
        let intent = 'help';
        let parameters = { chain };
        
        if (lowercaseMessage.includes('balance') && address) {
            intent = 'wallet_balance';
            parameters.address = address;
        } else if (lowercaseMessage.includes('nft') && address && tokenId) {
            intent = 'nft_details';
            parameters.contractAddress = address;
            parameters.tokenId = tokenId;
        } else if (lowercaseMessage.includes('token') || lowercaseMessage.includes('price')) {
            intent = 'token_info';
            if (address) {
                parameters.token = address;
            } else {
                // Extract potential token symbols
                const tokenMatch = message.match(/\b([A-Z]{2,6})\b/);
                if (tokenMatch) {
                    parameters.token = tokenMatch[1];
                }
            }
        } else if (lowercaseMessage.includes('transaction') || lowercaseMessage.includes('tx')) {
            intent = 'transaction_details';
            const txMatch = message.match(/0x[a-fA-F0-9]{64}/);
            if (txMatch) {
                parameters.txHash = txMatch[0];
            }
        }
        
        return {
            intent,
            parameters,
            confidence: 0.8
        };
    }

    /**
     * Fallback response formatter
     * @param {Object} data - Data to format
     * @param {string} intent - Intent type
     * @returns {string} Formatted response
     */
    fallbackFormatter(data, intent) {
        switch (intent) {
            case 'wallet_balance':
                return `💰 Wallet Balance:\n${data.balance || 'N/A'} ETH\n\nValue: $${data.valueUsd || 'N/A'}`;
            
            case 'token_info':
                return `🪙 Token Info:\n${data.name || 'Unknown'} (${data.symbol || 'N/A'})\n\nPrice: $${data.price || 'N/A'}\nMarket Cap: $${data.marketCap || 'N/A'}`;
            
            case 'nft_details':
                return `🖼️ NFT Details:\n${data.name || 'Unknown NFT'}\n\nCollection: ${data.collection || 'N/A'}\nOwner: ${data.owner || 'N/A'}`;
            
            default:
                return `Here's your Web3 data:\n${JSON.stringify(data, null, 2)}`;
        }
    }
}

module.exports = new OpenAIService();
