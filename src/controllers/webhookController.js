const twilioService = require('../services/twilioService');
const noditService = require('../services/noditService');
const openaiService = require('../services/openaiService');
const messageParser = require('../utils/messageParser');
const responseFormatter = require('../utils/responseFormatter');
const logger = require('../config/logger');

class WebhookController {
    /**
     * Handle incoming WhatsApp messages from Twilio
     */
    async handleIncomingMessage(req, res) {
        try {
            const { Body, From, MessageSid } = req.body;
            const phoneNumber = twilioService.formatPhoneNumber(From);
            
            logger.info(`Received message from ${phoneNumber}: ${Body}`);
            
            // Send typing indicator
            await twilioService.sendTypingIndicator(phoneNumber);
            
            // Parse user intent
            const parsedIntent = await openaiService.parseUserIntent(Body);
            logger.info(`Parsed intent:`, parsedIntent);
            
            // Process the request based on intent
            let response;
            try {
                response = await this.processUserRequest(parsedIntent, phoneNumber);
            } catch (error) {
                logger.error('Error processing user request:', error);
                response = this.getErrorResponse(error);
            }
            
            // Send response back to user
            await twilioService.sendMessage(phoneNumber, response);
            
            // Log the interaction
            logger.info(`Sent response to ${phoneNumber}: ${response.substring(0, 100)}...`);
            
            res.status(200).send('OK');
        } catch (error) {
            logger.error('Error in webhook handler:', error);
            res.status(500).send('Internal Server Error');
        }
    }
    
    /**
     * Process user request based on parsed intent
     */
    async processUserRequest(parsedIntent, phoneNumber) {
        const { intent, parameters } = parsedIntent;
        
        switch (intent) {
            case 'wallet_balance':
                return await this.handleWalletBalance(parameters);
            
            case 'token_info':
                return await this.handleTokenInfo(parameters);
            
            case 'nft_details':
                return await this.handleNFTDetails(parameters);
            
            case 'price_query':
                return await this.handlePriceQuery(parameters);
            
            case 'transaction_details':
                return await this.handleTransactionDetails(parameters);
            
            case 'help':
            default:
                return this.getHelpMessage();
        }
    }
    
    /**
     * Handle wallet balance queries
     */
    async handleWalletBalance(parameters) {
        const { address, chain = 'ethereum' } = parameters;
        
        if (!address) {
            return "Please provide a valid wallet address. Example: 'Check balance for 0x742d35Cc4Bf86C6...abc'";
        }
        
        try {
            // Get wallet balance using Nodit API
            const balanceData = await noditService.getWalletBalance(address, chain);
            
            return await openaiService.generateResponse(balanceData, 'wallet_balance');
        } catch (error) {
            logger.error('Failed to get wallet balance:', error);
            throw new Error('Unable to fetch wallet balance. Please check the address and try again.');
        }
    }
    
    /**
     * Handle token information queries
     */
    async handleTokenInfo(parameters) {
        const { token, chain = 'ethereum' } = parameters;
        
        if (!token) {
            return "Please specify a token symbol or address. Example: 'What is USDC token?' or 'Token info for 0xA0b86...123'";
        }
        
        try {
            let tokenData;
            
            // If token looks like an address, get token info directly
            if (token.startsWith('0x') && token.length === 42) {
                tokenData = await noditService.getTokenInfo(token, chain);
            } else {
                // Search for token by symbol
                const searchResults = await noditService.searchTokens(token, chain);
                if (searchResults?.items && searchResults.items.length > 0) {
                    tokenData = searchResults.items[0];
                } else {
                    throw new Error('Token not found');
                }
            }
            
            return await openaiService.generateResponse(tokenData, 'token_info');
        } catch (error) {
            logger.error('Failed to get token info:', error);
            throw new Error(`Unable to find information for token "${token}". Please check the symbol or address.`);
        }
    }
    
    /**
     * Handle NFT details queries
     */
    async handleNFTDetails(parameters) {
        const { contractAddress, tokenId, chain = 'ethereum' } = parameters;
        
        if (!contractAddress || !tokenId) {
            return "Please provide both NFT contract address and token ID. Example: 'Show NFT details for 0x123...def #1234'";
        }
        
        try {
            const nftData = await noditService.getNFTDetails(contractAddress, tokenId, chain);
            
            return await openaiService.generateResponse(nftData, 'nft_details');
        } catch (error) {
            logger.error('Failed to get NFT details:', error);
            throw new Error('Unable to fetch NFT details. Please check the contract address and token ID.');
        }
    }
    
    /**
     * Handle price queries
     */
    async handlePriceQuery(parameters) {
        const { token, chain = 'ethereum' } = parameters;
        
        if (!token) {
            return "Please specify a token for price information. Example: 'What's the price of ETH?'";
        }
        
        try {
            let priceData;
            
            if (token.startsWith('0x')) {
                // Token contract address provided
                priceData = await noditService.getTokenPrice(token, chain);
            } else {
                // Token symbol provided - try common tokens first
                try {
                    priceData = await noditService.getTokenPriceBySymbol(token, chain);
                } catch (error) {
                    // If not a common token, search for it
                    const searchResults = await noditService.searchTokens(token, chain);
                    if (searchResults?.items && searchResults.items.length > 0) {
                        const tokenData = searchResults.items[0];
                        priceData = await noditService.getTokenPrice(tokenData.address, chain);
                        if (priceData) {
                            priceData.symbol = tokenData.symbol;
                            priceData.name = tokenData.name;
                        }
                    } else {
                        throw new Error('Token not found');
                    }
                }
            }
            
            if (!priceData) {
                throw new Error('Price data not available');
            }
            
            return await openaiService.generateResponse(priceData, 'price_query');
        } catch (error) {
            logger.error('Failed to get price:', error);
            throw new Error(`Unable to get price for "${token}". Please check the token symbol or address.`);
        }
    }
    
    /**
     * Handle transaction details queries
     */
    async handleTransactionDetails(parameters) {
        const { txHash, chain = 'ethereum' } = parameters;
        
        if (!txHash) {
            return "Please provide a transaction hash. Example: 'Show transaction 0xabc...123'";
        }
        
        try {
            let txData;
            try {
                txData = await mcpService.getTransactionDetails(txHash, chain);
            } catch (error) {
                // Direct API call for transaction details
                throw new Error('Transaction lookup not implemented in direct API');
            }
            
            return await openaiService.generateResponse(txData, 'transaction_details');
        } catch (error) {
            logger.error('Failed to get transaction details:', error);
            throw new Error('Unable to fetch transaction details. Please check the transaction hash.');
        }
    }
    
    /**
     * Get help message
     */
    getHelpMessage() {
        return `🪙 *WallyBot - Your Web3 Assistant*

I can help you with:

💰 *Wallet Balance*
"Check balance for 0x742d35..."

🪙 *Token Information*
"What is USDC token?"
"Token info for 0xA0b86..."

🖼️ *NFT Details*
"Show NFT details for 0x123...def #1234"

💵 *Token Prices*
"What's the price of ETH?"

🔍 *Transaction Details*
"Show transaction 0xabc...123"

📊 *Supported Chains*
• Ethereum
• Polygon

Just send me a message in natural language! 🚀`;
    }
    
    /**
     * Get error response message
     */
    getErrorResponse(error) {
        const errorMessage = error.message || 'An unexpected error occurred';
        
        return `❌ *Error*

${errorMessage}

Try:
• Checking your wallet address format
• Using a supported blockchain (Ethereum, Polygon)
• Sending "help" for available commands

Need assistance? Send "help" for examples! 🔧`;
    }
}

module.exports = new WebhookController();
