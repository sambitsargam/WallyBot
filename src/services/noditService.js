const axios = require('axios');
const logger = require('../config/logger');

class NoditService {
    constructor() {
        this.baseURL = process.env.NODIT_BASE_URL || 'https://api.nodit.io';
        this.apiKey = process.env.NODIT_API_KEY;
        this.client = axios.create({
            baseURL: this.baseURL,
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            }
        });
    }

    /**
     * Get wallet balance
     * @param {string} address - Wallet address
     * @param {string} chain - Blockchain (ethereum, polygon)
     */
    async getWalletBalance(address, chain = 'ethereum') {
        try {
            const response = await this.client.get(`/v1/${chain}/accounts/${address}/balance`);
            logger.info(`Retrieved balance for ${address} on ${chain}`);
            return response.data;
        } catch (error) {
            logger.error(`Failed to get wallet balance for ${address}:`, error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Get token information
     * @param {string} tokenAddress - Token contract address
     * @param {string} chain - Blockchain
     */
    async getTokenInfo(tokenAddress, chain = 'ethereum') {
        try {
            const response = await this.client.get(`/v1/${chain}/tokens/${tokenAddress}`);
            logger.info(`Retrieved token info for ${tokenAddress} on ${chain}`);
            return response.data;
        } catch (error) {
            logger.error(`Failed to get token info for ${tokenAddress}:`, error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Get token price
     * @param {string} tokenAddress - Token contract address
     * @param {string} chain - Blockchain
     */
    async getTokenPrice(tokenAddress, chain = 'ethereum') {
        try {
            const response = await this.client.get(`/v1/${chain}/tokens/${tokenAddress}/price`);
            logger.info(`Retrieved price for token ${tokenAddress} on ${chain}`);
            return response.data;
        } catch (error) {
            logger.error(`Failed to get token price for ${tokenAddress}:`, error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Get NFT details
     * @param {string} contractAddress - NFT contract address
     * @param {string} tokenId - NFT token ID
     * @param {string} chain - Blockchain
     */
    async getNFTDetails(contractAddress, tokenId, chain = 'ethereum') {
        try {
            const response = await this.client.get(`/v1/${chain}/nfts/${contractAddress}/${tokenId}`);
            logger.info(`Retrieved NFT details for ${contractAddress}/${tokenId} on ${chain}`);
            return response.data;
        } catch (error) {
            logger.error(`Failed to get NFT details for ${contractAddress}/${tokenId}:`, error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Get wallet transactions
     * @param {string} address - Wallet address
     * @param {string} chain - Blockchain
     * @param {number} limit - Number of transactions to fetch
     */
    async getWalletTransactions(address, chain = 'ethereum', limit = 10) {
        try {
            const response = await this.client.get(`/v1/${chain}/accounts/${address}/transactions`, {
                params: { limit }
            });
            logger.info(`Retrieved ${limit} transactions for ${address} on ${chain}`);
            return response.data;
        } catch (error) {
            logger.error(`Failed to get transactions for ${address}:`, error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Get wallet token holdings
     * @param {string} address - Wallet address
     * @param {string} chain - Blockchain
     */
    async getWalletTokens(address, chain = 'ethereum') {
        try {
            const response = await this.client.get(`/v1/${chain}/accounts/${address}/tokens`);
            logger.info(`Retrieved token holdings for ${address} on ${chain}`);
            return response.data;
        } catch (error) {
            logger.error(`Failed to get token holdings for ${address}:`, error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Get wallet NFTs
     * @param {string} address - Wallet address
     * @param {string} chain - Blockchain
     */
    async getWalletNFTs(address, chain = 'ethereum') {
        try {
            const response = await this.client.get(`/v1/${chain}/accounts/${address}/nfts`);
            logger.info(`Retrieved NFTs for ${address} on ${chain}`);
            return response.data;
        } catch (error) {
            logger.error(`Failed to get NFTs for ${address}:`, error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Search for tokens by name or symbol
     * @param {string} query - Search query
     * @param {string} chain - Blockchain
     */
    async searchTokens(query, chain = 'ethereum') {
        try {
            const response = await this.client.get(`/v1/${chain}/tokens/search`, {
                params: { q: query }
            });
            logger.info(`Searched for tokens with query: ${query} on ${chain}`);
            return response.data;
        } catch (error) {
            logger.error(`Failed to search tokens with query ${query}:`, error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Get gas prices
     * @param {string} chain - Blockchain
     */
    async getGasPrices(chain = 'ethereum') {
        try {
            const response = await this.client.get(`/v1/${chain}/gas`);
            logger.info(`Retrieved gas prices for ${chain}`);
            return response.data;
        } catch (error) {
            logger.error(`Failed to get gas prices for ${chain}:`, error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Get block information
     * @param {string|number} blockNumber - Block number or 'latest'
     * @param {string} chain - Blockchain
     */
    async getBlock(blockNumber = 'latest', chain = 'ethereum') {
        try {
            const response = await this.client.get(`/v1/${chain}/blocks/${blockNumber}`);
            logger.info(`Retrieved block ${blockNumber} for ${chain}`);
            return response.data;
        } catch (error) {
            logger.error(`Failed to get block ${blockNumber} for ${chain}:`, error.response?.data || error.message);
            throw error;
        }
    }
}

module.exports = new NoditService();
