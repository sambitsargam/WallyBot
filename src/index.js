const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const logger = require('./config/logger');
const webhookController = require('./controllers/webhookController');
const rateLimiter = require('./middleware/rateLimiter');
const auth = require('./middleware/auth');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(rateLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: require('../package.json').version
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        name: 'WallyBot',
        description: 'WhatsApp Web3 Assistant',
        version: require('../package.json').version,
        endpoints: {
            webhook: '/webhook',
            health: '/health'
        }
    });
});

// Twilio webhook endpoint
app.post('/webhook', auth.validateTwilioSignature, webhookController.handleIncomingMessage);

// Error handling middleware
app.use((err, req, res, next) => {
    logger.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Not found',
        message: 'The requested endpoint does not exist'
    });
});

// Start server
app.listen(PORT, () => {
    logger.info(`🪙 WallyBot server is running on port ${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info('✅ WhatsApp Web3 Assistant is ready!');
});

// Graceful shutdown
process.on('SIGINT', () => {
    logger.info('Received SIGINT, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    logger.info('Received SIGTERM, shutting down gracefully...');
    process.exit(0);
});

module.exports = app;
