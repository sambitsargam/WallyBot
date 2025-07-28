// Jest setup file
process.env.NODE_ENV = 'test';

// Mock environment variables for testing
process.env.TWILIO_ACCOUNT_SID = 'test_twilio_sid';
process.env.TWILIO_AUTH_TOKEN = 'test_twilio_token';
process.env.TWILIO_PHONE_NUMBER = '+1234567890';
process.env.NODIT_API_KEY = 'test_nodit_key';
process.env.OPENAI_API_KEY = 'test_openai_key';

// Suppress console logs during testing unless needed
global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
};
