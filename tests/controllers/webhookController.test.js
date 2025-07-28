const webhookController = require('../../src/controllers/webhookController');
const twilioService = require('../../src/services/twilioService');
const noditService = require('../../src/services/noditService');

// Mock services
jest.mock('../../src/services/twilioService');
jest.mock('../../src/services/noditService');
jest.mock('../../src/services/mcpService');
jest.mock('../../src/services/openaiService');

describe('WebhookController', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('handleIncomingMessage', () => {
        const mockReq = {
            body: {
                Body: 'Check balance for 0x742d35Cc4Bf86C6',
                From: 'whatsapp:+1234567890',
                MessageSid: 'SMtest123'
            }
        };

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        };

        test('should handle wallet balance request', async () => {
            // Mock services
            twilioService.formatPhoneNumber.mockReturnValue('+1234567890');
            twilioService.sendTypingIndicator.mockResolvedValue();
            twilioService.sendMessage.mockResolvedValue({ sid: 'SMtest123' });

            await webhookController.handleIncomingMessage(mockReq, mockRes);

            expect(twilioService.sendMessage).toHaveBeenCalled();
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.send).toHaveBeenCalledWith('OK');
        });

        test('should handle errors gracefully', async () => {
            twilioService.formatPhoneNumber.mockImplementation(() => {
                throw new Error('Service error');
            });

            await webhookController.handleIncomingMessage(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.send).toHaveBeenCalledWith('Internal Server Error');
        });
    });

    describe('processUserRequest', () => {
        test('should return help message for help intent', async () => {
            const parsedIntent = { intent: 'help', parameters: {} };
            const phoneNumber = '+1234567890';

            const result = await webhookController.processUserRequest(parsedIntent, phoneNumber);

            expect(result).toContain('WallyBot');
            expect(result).toContain('Wallet Balance');
        });

        test('should handle wallet balance intent', async () => {
            const parsedIntent = {
                intent: 'wallet_balance',
                parameters: { address: '0x742d35Cc4Bf86C6', chain: 'ethereum' }
            };
            const phoneNumber = '+1234567890';

            noditService.getWalletBalance.mockResolvedValue({
                balance: '1.5',
                valueUsd: '2500'
            });

            const result = await webhookController.processUserRequest(parsedIntent, phoneNumber);

            expect(noditService.getWalletBalance).toHaveBeenCalledWith('0x742d35Cc4Bf86C6', 'ethereum');
            expect(result).toBeDefined();
        });
    });
});
