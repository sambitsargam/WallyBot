const logger = require('../config/logger');

class ResponseFormatter {
    /**
     * Format wallet balance response
     * @param {Object} balanceData - Balance data from API
     * @param {string} address - Wallet address
     * @param {string} chain - Blockchain name
     * @returns {string} Formatted response
     */
    static formatWalletBalance(balanceData, address, chain) {
        try {
            const shortAddress = this.shortenAddress(address);
            const chainEmoji = this.getChainEmoji(chain);
            
            let response = `💰 *Wallet Balance* ${chainEmoji}\n\n`;
            response += `📍 Address: \`${shortAddress}\`\n`;
            response += `⛓️ Chain: ${this.capitalizeFirst(chain)}\n\n`;
            
            if (balanceData.balance) {
                const balance = parseFloat(balanceData.balance).toFixed(4);
                response += `💎 Balance: *${balance} ${this.getChainSymbol(chain)}*\n`;
            }
            
            if (balanceData.valueUsd) {
                const usdValue = parseFloat(balanceData.valueUsd).toFixed(2);
                response += `💵 USD Value: *$${this.formatNumber(usdValue)}*\n`;
            }
            
            if (balanceData.tokens && balanceData.tokens.length > 0) {
                response += `\n🪙 *Top Tokens:*\n`;
                balanceData.tokens.slice(0, 3).forEach(token => {
                    response += `• ${token.symbol}: ${parseFloat(token.balance).toFixed(2)}\n`;
                });
            }
            
            return response;
        } catch (error) {
            logger.error('Error formatting balance response:', error);
            return this.formatError('Failed to format wallet balance information');
        }
    }

    /**
     * Format token information response
     * @param {Object} tokenData - Token data from API
     * @param {string} chain - Blockchain name
     * @returns {string} Formatted response
     */
    static formatTokenInfo(tokenData, chain) {
        try {
            const chainEmoji = this.getChainEmoji(chain);
            
            let response = `🪙 *Token Information* ${chainEmoji}\n\n`;
            
            if (tokenData.name) {
                response += `📛 Name: *${tokenData.name}*\n`;
            }
            
            if (tokenData.symbol) {
                response += `🏷️ Symbol: *${tokenData.symbol}*\n`;
            }
            
            if (tokenData.address) {
                const shortAddress = this.shortenAddress(tokenData.address);
                response += `📍 Address: \`${shortAddress}\`\n`;
            }
            
            response += `⛓️ Chain: ${this.capitalizeFirst(chain)}\n\n`;
            
            if (tokenData.price) {
                const price = parseFloat(tokenData.price).toFixed(6);
                response += `💰 Price: *$${this.formatNumber(price)}*\n`;
            }
            
            if (tokenData.marketCap) {
                const marketCap = parseFloat(tokenData.marketCap);
                response += `📊 Market Cap: *$${this.formatLargeNumber(marketCap)}*\n`;
            }
            
            if (tokenData.totalSupply) {
                const supply = parseFloat(tokenData.totalSupply);
                response += `🔢 Total Supply: *${this.formatLargeNumber(supply)}*\n`;
            }
            
            if (tokenData.decimals) {
                response += `🔸 Decimals: *${tokenData.decimals}*\n`;
            }
            
            return response;
        } catch (error) {
            logger.error('Error formatting token response:', error);
            return this.formatError('Failed to format token information');
        }
    }

    /**
     * Format NFT details response
     * @param {Object} nftData - NFT data from API
     * @param {string} chain - Blockchain name
     * @returns {string} Formatted response
     */
    static formatNFTDetails(nftData, chain) {
        try {
            const chainEmoji = this.getChainEmoji(chain);
            
            let response = `🖼️ *NFT Details* ${chainEmoji}\n\n`;
            
            if (nftData.name) {
                response += `🎨 Name: *${nftData.name}*\n`;
            }
            
            if (nftData.tokenId) {
                response += `🆔 Token ID: *${nftData.tokenId}*\n`;
            }
            
            if (nftData.collection) {
                response += `📚 Collection: *${nftData.collection}*\n`;
            }
            
            if (nftData.contractAddress) {
                const shortAddress = this.shortenAddress(nftData.contractAddress);
                response += `📍 Contract: \`${shortAddress}\`\n`;
            }
            
            response += `⛓️ Chain: ${this.capitalizeFirst(chain)}\n\n`;
            
            if (nftData.owner) {
                const shortOwner = this.shortenAddress(nftData.owner);
                response += `👤 Owner: \`${shortOwner}\`\n`;
            }
            
            if (nftData.description) {
                const desc = nftData.description.length > 100 
                    ? nftData.description.substring(0, 100) + '...' 
                    : nftData.description;
                response += `📝 Description: ${desc}\n`;
            }
            
            if (nftData.attributes && nftData.attributes.length > 0) {
                response += `\n✨ *Attributes:*\n`;
                nftData.attributes.slice(0, 3).forEach(attr => {
                    response += `• ${attr.trait_type}: ${attr.value}\n`;
                });
            }
            
            return response;
        } catch (error) {
            logger.error('Error formatting NFT response:', error);
            return this.formatError('Failed to format NFT information');
        }
    }

    /**
     * Format price query response
     * @param {Object} priceData - Price data from API
     * @param {string} token - Token symbol or address
     * @param {string} chain - Blockchain name
     * @returns {string} Formatted response
     */
    static formatPriceQuery(priceData, token, chain) {
        try {
            const chainEmoji = this.getChainEmoji(chain);
            
            let response = `💰 *Token Price* ${chainEmoji}\n\n`;
            
            const tokenName = priceData.symbol || priceData.name || token;
            response += `🪙 Token: *${tokenName}*\n`;
            response += `⛓️ Chain: ${this.capitalizeFirst(chain)}\n\n`;
            
            if (priceData.price) {
                const price = parseFloat(priceData.price);
                response += `💵 Current Price: *$${this.formatNumber(price.toFixed(6))}*\n`;
            }
            
            if (priceData.priceChange24h) {
                const change = parseFloat(priceData.priceChange24h);
                const changeEmoji = change >= 0 ? '📈' : '📉';
                const changeSign = change >= 0 ? '+' : '';
                response += `${changeEmoji} 24h Change: *${changeSign}${change.toFixed(2)}%*\n`;
            }
            
            if (priceData.volume24h) {
                const volume = parseFloat(priceData.volume24h);
                response += `📊 24h Volume: *$${this.formatLargeNumber(volume)}*\n`;
            }
            
            if (priceData.marketCap) {
                const marketCap = parseFloat(priceData.marketCap);
                response += `🏦 Market Cap: *$${this.formatLargeNumber(marketCap)}*\n`;
            }
            
            response += `\n🕐 Last Updated: ${new Date().toLocaleTimeString()}`;
            
            return response;
        } catch (error) {
            logger.error('Error formatting price response:', error);
            return this.formatError('Failed to format price information');
        }
    }

    /**
     * Format transaction details response
     * @param {Object} txData - Transaction data from API
     * @param {string} chain - Blockchain name
     * @returns {string} Formatted response
     */
    static formatTransactionDetails(txData, chain) {
        try {
            const chainEmoji = this.getChainEmoji(chain);
            
            let response = `🔍 *Transaction Details* ${chainEmoji}\n\n`;
            
            if (txData.hash) {
                const shortHash = this.shortenHash(txData.hash);
                response += `🔗 Hash: \`${shortHash}\`\n`;
            }
            
            response += `⛓️ Chain: ${this.capitalizeFirst(chain)}\n`;
            
            if (txData.status) {
                const statusEmoji = txData.status === 'success' ? '✅' : '❌';
                response += `${statusEmoji} Status: *${this.capitalizeFirst(txData.status)}*\n`;
            }
            
            if (txData.blockNumber) {
                response += `📦 Block: *${this.formatNumber(txData.blockNumber)}*\n`;
            }
            
            response += '\n';
            
            if (txData.from) {
                const shortFrom = this.shortenAddress(txData.from);
                response += `📤 From: \`${shortFrom}\`\n`;
            }
            
            if (txData.to) {
                const shortTo = this.shortenAddress(txData.to);
                response += `📥 To: \`${shortTo}\`\n`;
            }
            
            if (txData.value) {
                const value = parseFloat(txData.value);
                response += `💎 Value: *${value.toFixed(4)} ${this.getChainSymbol(chain)}*\n`;
            }
            
            if (txData.gasUsed && txData.gasPrice) {
                const gasFee = parseFloat(txData.gasUsed) * parseFloat(txData.gasPrice) / 1e18;
                response += `⛽ Gas Fee: *${gasFee.toFixed(6)} ${this.getChainSymbol(chain)}*\n`;
            }
            
            if (txData.timestamp) {
                const date = new Date(txData.timestamp * 1000);
                response += `\n🕐 Time: ${date.toLocaleString()}`;
            }
            
            return response;
        } catch (error) {
            logger.error('Error formatting transaction response:', error);
            return this.formatError('Failed to format transaction information');
        }
    }

    /**
     * Format error response
     * @param {string} message - Error message
     * @returns {string} Formatted error response
     */
    static formatError(message) {
        return `❌ *Error*\n\n${message}\n\nTry sending "help" for available commands! 🆘`;
    }

    /**
     * Format help response
     * @returns {string} Formatted help response
     */
    static formatHelp() {
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
• Ethereum 🔷
• Polygon 🟣

Just send me a message in natural language! 🚀

Need more help? Visit our docs or contact support! 📖`;
    }

    /**
     * Shorten Ethereum address for display
     * @param {string} address - Full address
     * @returns {string} Shortened address
     */
    static shortenAddress(address) {
        if (!address || address.length < 10) return address;
        return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    }

    /**
     * Shorten transaction hash for display
     * @param {string} hash - Full hash
     * @returns {string} Shortened hash
     */
    static shortenHash(hash) {
        if (!hash || hash.length < 10) return hash;
        return `${hash.substring(0, 8)}...${hash.substring(hash.length - 6)}`;
    }

    /**
     * Get emoji for blockchain
     * @param {string} chain - Blockchain name
     * @returns {string} Chain emoji
     */
    static getChainEmoji(chain) {
        const emojis = {
            ethereum: '🔷',
            polygon: '🟣',
            bitcoin: '🟠',
            binance: '🟡'
        };
        return emojis[chain.toLowerCase()] || '⛓️';
    }

    /**
     * Get symbol for blockchain
     * @param {string} chain - Blockchain name
     * @returns {string} Chain symbol
     */
    static getChainSymbol(chain) {
        const symbols = {
            ethereum: 'ETH',
            polygon: 'MATIC',
            bitcoin: 'BTC',
            binance: 'BNB'
        };
        return symbols[chain.toLowerCase()] || 'ETH';
    }

    /**
     * Capitalize first letter
     * @param {string} str - String to capitalize
     * @returns {string} Capitalized string
     */
    static capitalizeFirst(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }

    /**
     * Format number with commas
     * @param {string|number} num - Number to format
     * @returns {string} Formatted number
     */
    static formatNumber(num) {
        return parseFloat(num).toLocaleString();
    }

    /**
     * Format large numbers with K, M, B suffixes
     * @param {number} num - Number to format
     * @returns {string} Formatted number
     */
    static formatLargeNumber(num) {
        if (num >= 1e9) {
            return (num / 1e9).toFixed(2) + 'B';
        } else if (num >= 1e6) {
            return (num / 1e6).toFixed(2) + 'M';
        } else if (num >= 1e3) {
            return (num / 1e3).toFixed(2) + 'K';
        }
        return num.toFixed(2);
    }
}

module.exports = ResponseFormatter;
