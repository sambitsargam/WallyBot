const { Client } = require('@modelcontextprotocol/sdk');
const logger = require('../config/logger');

class MCPService {
    constructor() {
        this.client = null;
        this.isConnected = false;
    }

    /**
     * Initialize MCP connection
     */
    async initialize() {
        try {
            this.client = new Client({
                name: 'wallybot',
                version: '1.0.0'
            });

            // Connect to Nodit MCP server
            await this.client.connect({
                transport: {
                    type: 'stdio',
                    command: 'nodit-mcp-server',
                    args: ['--api-key', process.env.NODIT_API_KEY]
                }
            });

            this.isConnected = true;
            logger.info('✅ MCP client connected to Nodit server');
        } catch (error) {
            logger.error('Failed to initialize MCP client:', error);
            throw error;
        }
    }

    /**
     * List available MCP tools
     */
    async listTools() {
        try {
            if (!this.isConnected) {
                await this.initialize();
            }

            const tools = await this.client.listTools();
            logger.info(`Available MCP tools: ${tools.tools.map(t => t.name).join(', ')}`);
            return tools;
        } catch (error) {
            logger.error('Failed to list MCP tools:', error);
            throw error;
        }
    }

    /**
     * Call an MCP tool
     * @param {string} toolName - Name of the tool to call
     * @param {Object} arguments_ - Tool arguments
     */
    async callTool(toolName, arguments_) {
        try {
            if (!this.isConnected) {
                await this.initialize();
            }

            const result = await this.client.callTool({
                name: toolName,
                arguments: arguments_
            });

            logger.info(`Called MCP tool: ${toolName}`);
            return result;
        } catch (error) {
            logger.error(`Failed to call MCP tool ${toolName}:`, error);
            throw error;
        }
    }

    /**
     * Get wallet balance using MCP
     * @param {string} address - Wallet address
     * @param {string} chain - Blockchain
     */
    async getWalletBalance(address, chain = 'ethereum') {
        return this.callTool('get_wallet_balance', {
            address,
            chain
        });
    }

    /**
     * Get token information using MCP
     * @param {string} address - Token address
     * @param {string} chain - Blockchain
     */
    async getTokenInfo(address, chain = 'ethereum') {
        return this.callTool('get_token_info', {
            address,
            chain
        });
    }

    /**
     * Get NFT details using MCP
     * @param {string} contractAddress - NFT contract address
     * @param {string} tokenId - NFT token ID
     * @param {string} chain - Blockchain
     */
    async getNFTDetails(contractAddress, tokenId, chain = 'ethereum') {
        return this.callTool('get_nft_details', {
            contract_address: contractAddress,
            token_id: tokenId,
            chain
        });
    }

    /**
     * Search tokens using MCP
     * @param {string} query - Search query
     * @param {string} chain - Blockchain
     */
    async searchTokens(query, chain = 'ethereum') {
        return this.callTool('search_tokens', {
            query,
            chain
        });
    }

    /**
     * Get transaction details using MCP
     * @param {string} txHash - Transaction hash
     * @param {string} chain - Blockchain
     */
    async getTransactionDetails(txHash, chain = 'ethereum') {
        return this.callTool('get_transaction', {
            hash: txHash,
            chain
        });
    }

    /**
     * Get wallet transactions using MCP
     * @param {string} address - Wallet address
     * @param {string} chain - Blockchain
     * @param {number} limit - Number of transactions
     */
    async getWalletTransactions(address, chain = 'ethereum', limit = 10) {
        return this.callTool('get_wallet_transactions', {
            address,
            chain,
            limit
        });
    }

    /**
     * Disconnect MCP client
     */
    async disconnect() {
        try {
            if (this.client && this.isConnected) {
                await this.client.close();
                this.isConnected = false;
                logger.info('MCP client disconnected');
            }
        } catch (error) {
            logger.error('Error disconnecting MCP client:', error);
        }
    }
}

module.exports = new MCPService();
