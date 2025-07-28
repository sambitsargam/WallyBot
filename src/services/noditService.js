const axios = require('axios');
const logger = require('../config/logger');

class NoditService {
    constructor() {
        this.baseURL = process.env.NODIT_BASE_URL || 'https://web3.nodit.io/v1';
        this.apiKey = process.env.NODIT_API_KEY;
        this.client = axios.create({
            baseURL: this.baseURL,
            headers: {
                'X-API-KEY': this.apiKey,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
    }

    /**
     * Map chain names to Nodit protocol/network format
     */
    getChainConfig(chain) {
        const chainMap = {
            'ethereum': { protocol: 'ethereum', network: 'mainnet' },
            'polygon': { protocol: 'polygon', network: 'mainnet' },
            'eth': { protocol: 'ethereum', network: 'mainnet' },
            'matic': { protocol: 'polygon', network: 'mainnet' }
        };
        return chainMap[chain.toLowerCase()] || { protocol: 'ethereum', network: 'mainnet' };
    }

    /**
     * Get wallet balance (native tokens like ETH, MATIC)
     * @param {string} address - Wallet address
     * @param {string} chain - Blockchain (ethereum, polygon)
     */
    async getWalletBalance(address, chain = 'ethereum') {
        try {
            const { protocol, network } = this.getChainConfig(chain);
            
            // Get native balance
            const nativeResponse = await this.client.post(`/${protocol}/${network}/native/getNativeBalanceByAccount`, {
                accountAddress: address
            });

            // Get token balances
            const tokenResponse = await this.client.post(`/${protocol}/${network}/token/getTokensOwnedByAccount`, {
                accountAddress: address,
                rpp: 50
            });

            const result = {
                native: nativeResponse.data,
                tokens: tokenResponse.data?.items || []
            };

            logger.info(`Retrieved balance for ${address} on ${chain}`);
            return result;
        } catch (error) {
            logger.error(`Failed to get wallet balance for ${address}:`, error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Get token information by contract address
     * @param {string} tokenAddress - Token contract address
     * @param {string} chain - Blockchain
     */
    async getTokenInfo(tokenAddress, chain = 'ethereum') {
        try {
            const { protocol, network } = this.getChainConfig(chain);
            
            const response = await this.client.post(`/${protocol}/${network}/token/getTokenContractMetadataByContracts`, {
                contractAddresses: [tokenAddress]
            });

            logger.info(`Retrieved token info for ${tokenAddress} on ${chain}`);
            return response.data?.[0] || null;
        } catch (error) {
            logger.error(`Failed to get token info for ${tokenAddress}:`, error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Get token price by contract address
     * @param {string} tokenAddress - Token contract address
     * @param {string} chain - Blockchain
     */
    async getTokenPrice(tokenAddress, chain = 'ethereum') {
        try {
            const { protocol, network } = this.getChainConfig(chain);
            
            const response = await this.client.post(`/${protocol}/${network}/token/getTokenPricesByContracts`, {
                contractAddresses: [tokenAddress],
                currency: 'USD'
            });

            logger.info(`Retrieved price for token ${tokenAddress} on ${chain}`);
            return response.data?.[0] || null;
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
            const { protocol, network } = this.getChainConfig(chain);
            
            const response = await this.client.post(`/${protocol}/${network}/nft/getNftMetadataByTokenIds`, {
                contractAddress: contractAddress,
                tokenIds: [tokenId]
            });

            logger.info(`Retrieved NFT details for ${contractAddress}/${tokenId} on ${chain}`);
            return response.data?.items?.[0] || null;
        } catch (error) {
            logger.error(`Failed to get NFT details for ${contractAddress}/${tokenId}:`, error.response?.data || error.message);
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
            const { protocol, network } = this.getChainConfig(chain);
            
            const response = await this.client.post(`/${protocol}/${network}/token/getTokensOwnedByAccount`, {
                accountAddress: address,
                rpp: 100
            });

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
            const { protocol, network } = this.getChainConfig(chain);
            
            const response = await this.client.post(`/${protocol}/${network}/account/getNftsOwnedByAccount`, {
                accountAddress: address,
                rpp: 50
            });

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
            const { protocol, network } = this.getChainConfig(chain);
            
            const response = await this.client.post(`/${protocol}/${network}/token/searchTokenContractMetadataByKeyword`, {
                keyword: query,
                rpp: 20
            });

            logger.info(`Searched for tokens with query: ${query} on ${chain}`);
            return response.data;
        } catch (error) {
            logger.error(`Failed to search tokens with query ${query}:`, error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Get common token addresses for price lookup
     */
    getCommonTokens(chain = 'ethereum') {
        const tokens = {
            ethereum: {
                'ETH': null, // Native token
                'USDC': '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
                'USDT': '0xdAC17F958D2ee523a2206206994597C13D831ec7',
                'WETH': '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
                'DAI': '0x6B175474E89094C44Da98b954EedeAC495271d0F',
                'WBTC': '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599'
            },
            polygon: {
                'MATIC': null, // Native token
                'USDC': '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
                'USDT': '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
                'WETH': '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
                'WMATIC': '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270'
            }
        };
        return tokens[chain.toLowerCase()] || tokens.ethereum;
    }

    /**
     * Get token price by symbol (for common tokens)
     * @param {string} symbol - Token symbol (ETH, USDC, etc.)
     * @param {string} chain - Blockchain
     */
    async getTokenPriceBySymbol(symbol, chain = 'ethereum') {
        try {
            const commonTokens = this.getCommonTokens(chain);
            const tokenAddress = commonTokens[symbol.toUpperCase()];
            
            if (!tokenAddress) {
                // For native tokens, we'll need to use a different approach
                // For now, let's search for the token
                const searchResult = await this.searchTokens(symbol, chain);
                if (searchResult?.items?.length > 0) {
                    const token = searchResult.items[0];
                    return await this.getTokenPrice(token.address, chain);
                }
                throw new Error(`Token ${symbol} not found on ${chain}`);
            }
            
            return await this.getTokenPrice(tokenAddress, chain);
        } catch (error) {
            logger.error(`Failed to get price for ${symbol}:`, error.message);
            throw error;
        }
    }
}

module.exports = new NoditService();
