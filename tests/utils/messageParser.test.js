const MessageParser = require('../../src/utils/messageParser');

describe('MessageParser', () => {
    describe('extractAddresses', () => {
        test('should extract valid Ethereum addresses', () => {
            const message = 'Check balance for 0x742d35Cc4Bf86C6D8Ba9352532Fd1e42a5D9e69B and 0xA0b86a33E6b2A36Bb3B0B2c7B5C3a5E35D2E25F1';
            const addresses = MessageParser.extractAddresses(message);
            
            expect(addresses).toHaveLength(2);
            expect(addresses[0]).toBe('0x742d35Cc4Bf86C6D8Ba9352532Fd1e42a5D9e69B');
            expect(addresses[1]).toBe('0xA0b86a33E6b2A36Bb3B0B2c7B5C3a5E35D2E25F1');
        });

        test('should return empty array when no addresses found', () => {
            const message = 'What is the price of ETH?';
            const addresses = MessageParser.extractAddresses(message);
            
            expect(addresses).toHaveLength(0);
        });
    });

    describe('extractTokenIds', () => {
        test('should extract token IDs after # symbol', () => {
            const message = 'Show NFT #1234 and #5678';
            const tokenIds = MessageParser.extractTokenIds(message);
            
            expect(tokenIds).toHaveLength(2);
            expect(tokenIds[0]).toBe('1234');
            expect(tokenIds[1]).toBe('5678');
        });

        test('should return empty array when no token IDs found', () => {
            const message = 'Check my wallet balance';
            const tokenIds = MessageParser.extractTokenIds(message);
            
            expect(tokenIds).toHaveLength(0);
        });
    });

    describe('detectBlockchain', () => {
        test('should detect Ethereum', () => {
            expect(MessageParser.detectBlockchain('Check ETH balance')).toBe('ethereum');
            expect(MessageParser.detectBlockchain('ethereum wallet')).toBe('ethereum');
        });

        test('should detect Polygon', () => {
            expect(MessageParser.detectBlockchain('Check MATIC balance')).toBe('polygon');
            expect(MessageParser.detectBlockchain('polygon wallet')).toBe('polygon');
        });

        test('should default to Ethereum', () => {
            expect(MessageParser.detectBlockchain('Check balance')).toBe('ethereum');
        });
    });

    describe('detectIntent', () => {
        test('should detect wallet balance intent', () => {
            expect(MessageParser.detectIntent('Check my wallet balance')).toBe('wallet_balance');
            expect(MessageParser.detectIntent('How much ETH do I have?')).toBe('wallet_balance');
        });

        test('should detect token info intent', () => {
            expect(MessageParser.detectIntent('What is USDC token?')).toBe('token_info');
            expect(MessageParser.detectIntent('Tell me about this token')).toBe('token_info');
        });

        test('should detect price query intent', () => {
            expect(MessageParser.detectIntent('What is the price of ETH?')).toBe('price_query');
            expect(MessageParser.detectIntent('How much is Bitcoin worth?')).toBe('price_query');
        });

        test('should detect NFT details intent', () => {
            expect(MessageParser.detectIntent('Show me this NFT')).toBe('nft_details');
        });

        test('should detect help intent', () => {
            expect(MessageParser.detectIntent('help')).toBe('help');
            expect(MessageParser.detectIntent('What can you do?')).toBe('help');
        });

        test('should default to help intent', () => {
            expect(MessageParser.detectIntent('random text')).toBe('help');
        });
    });

    describe('parseMessage', () => {
        test('should parse complete message with wallet balance intent', () => {
            const message = 'Check balance for 0x742d35Cc4Bf86C6D8Ba9352532Fd1e42a5D9e69B on ethereum';
            const parsed = MessageParser.parseMessage(message);
            
            expect(parsed.intent).toBe('wallet_balance');
            expect(parsed.addresses).toHaveLength(1);
            expect(parsed.addresses[0]).toBe('0x742d35Cc4Bf86C6D8Ba9352532Fd1e42a5D9e69B');
            expect(parsed.blockchain).toBe('ethereum');
        });

        test('should parse NFT query message', () => {
            const message = 'Show NFT details for 0xA0b86a33E6b2A36Bb3B0B2c7B5C3a5E35D2E25F1 #1234';
            const parsed = MessageParser.parseMessage(message);
            
            expect(parsed.intent).toBe('nft_details');
            expect(parsed.addresses).toHaveLength(1);
            expect(parsed.tokenIds).toHaveLength(1);
            expect(parsed.tokenIds[0]).toBe('1234');
        });

        test('should handle empty message', () => {
            const parsed = MessageParser.parseMessage('');
            
            expect(parsed.intent).toBe('help');
            expect(parsed.addresses).toHaveLength(0);
        });
    });

    describe('validateParsedData', () => {
        test('should validate wallet balance data', () => {
            const parsedData = {
                intent: 'wallet_balance',
                addresses: ['0x742d35Cc4Bf86C6D8Ba9352532Fd1e42a5D9e69B'],
                tokenIds: [],
                transactionHashes: []
            };
            
            const validation = MessageParser.validateParsedData(parsedData);
            expect(validation.isValid).toBe(true);
            expect(validation.errors).toHaveLength(0);
        });

        test('should invalidate wallet balance without address', () => {
            const parsedData = {
                intent: 'wallet_balance',
                addresses: [],
                tokenIds: [],
                transactionHashes: []
            };
            
            const validation = MessageParser.validateParsedData(parsedData);
            expect(validation.isValid).toBe(false);
            expect(validation.errors).toContain('Wallet address required for balance query');
        });

        test('should validate NFT query with warnings', () => {
            const parsedData = {
                intent: 'nft_details',
                addresses: [],
                tokenIds: [],
                transactionHashes: []
            };
            
            const validation = MessageParser.validateParsedData(parsedData);
            expect(validation.warnings).toContain('NFT queries require both contract address and token ID');
        });
    });

    describe('isValidAddress', () => {
        test('should validate correct address format', () => {
            expect(MessageParser.isValidAddress('0x742d35Cc4Bf86C6D8Ba9352532Fd1e42a5D9e69B')).toBe(true);
        });

        test('should invalidate incorrect address format', () => {
            expect(MessageParser.isValidAddress('0x742d35')).toBe(false);
            expect(MessageParser.isValidAddress('742d35Cc4Bf86C6D8Ba9352532Fd1e42a5D9e69B')).toBe(false);
            expect(MessageParser.isValidAddress('')).toBe(false);
        });
    });

    describe('isValidTransactionHash', () => {
        test('should validate correct hash format', () => {
            expect(MessageParser.isValidTransactionHash('0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef')).toBe(true);
        });

        test('should invalidate incorrect hash format', () => {
            expect(MessageParser.isValidTransactionHash('0x1234')).toBe(false);
            expect(MessageParser.isValidTransactionHash('1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef')).toBe(false);
            expect(MessageParser.isValidTransactionHash('')).toBe(false);
        });
    });
});
