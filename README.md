# WallyBot 🪙 - WhatsApp Web3 Assistant

> **Production-ready WhatsApp bot for Web3 data queries using Twilio and Nodit API**

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Production Ready](https://img.shields.io/badge/Production-Ready-brightgreen.svg)]()

## 🌟 Features

- **💬 WhatsApp Integration**: Seamless messaging via Twilio
- **� Multi-chain Support**: Ethereum & Polygon blockchain data
- **💰 Wallet Queries**: Check balances, token holdings, NFTs
- **� Real-time Prices**: Token prices with CoinMarketCap data
- **🤖 AI-Powered**: Natural language processing with OpenAI
- **🔒 Production Security**: Webhook signature validation, rate limiting
- **📊 Performance**: Clustering, caching, monitoring ready
- **🐳 Docker Support**: Containerized deployment

## � Quick Start

### Prerequisites
- Node.js 18+
- Twilio WhatsApp Business Account
- Nodit API Key
- OpenAI API Key (optional)

### 1. Clone & Install
```bash
git clone https://github.com/sambitsargam/WallyBot.git
cd WallyBot
npm install
```

### 2. Configure Environment
```bash
cp .env.production .env
# Edit .env with your API keys
```

### 3. Start Development
```bash
npm run dev
```

### 4. Production Deployment
```bash
npm run prod
# or with PM2
npm run pm2:start
```

## 🔑 Configuration

### Twilio Setup
1. Create a Twilio account at [twilio.com](https://twilio.com)
2. Set up WhatsApp Sandbox in the Twilio Console
3. Get your Account SID, Auth Token, and WhatsApp phone number
4. Configure webhook URL: `https://your-domain.com/webhook`

### Nodit Setup
1. Get your API key from [Nodit](https://docs.nodit.io)
2. Review the [MCP documentation](https://docs.nodit.io/mcp)
3. Set up webhooks for real-time alerts

### OpenAI Setup (Optional)
1. Get your API key from [OpenAI](https://platform.openai.com)
2. Enable advanced natural language processing

## 📱 Usage

### Basic Commands

Send these messages to your WhatsApp bot:

- **Wallet Balance**: `Check balance for 0x742...abc`
- **Token Info**: `What is USDC token?`
- **NFT Details**: `Show NFT details for 0x123...def #1234`
- **Price Query**: `What's the price of ETH?`
- **Help**: `help` or `commands`

### Supported Chains
- Ethereum (ETH)
- Polygon (MATIC)

## 🏗️ Project Structure

```
WallyBot/
├── src/
│   ├── index.js              # Main application entry
│   ├── config/
│   │   ├── database.js       # Database configuration
│   │   └── logger.js         # Logging configuration
│   ├── controllers/
│   │   ├── webhookController.js    # Twilio webhook handler
│   │   └── web3Controller.js       # Web3 query handler
│   ├── services/
│   │   ├── twilioService.js        # Twilio API service
│   │   ├── noditService.js         # Nodit API service
│   │   ├── mcpService.js           # MCP client service
│   │   └── openaiService.js        # OpenAI service
│   ├── utils/
│   │   ├── messageParser.js        # Parse WhatsApp messages
│   │   ├── responseFormatter.js    # Format bot responses
│   │   └── validators.js           # Input validation
│   └── middleware/
│       ├── auth.js                 # Authentication middleware
│       └── rateLimiter.js          # Rate limiting
├── tests/                          # Test files
├── docs/                           # Documentation
├── .env.example                    # Environment variables template
├── package.json
└── README.md
```

## 🔗 API Documentation

### Nodit Resources
- [Nodit Dev Docs](https://docs.nodit.io)
- [Nodit MCP Guide](https://docs.nodit.io/mcp)
- [Sample Nodit API](https://docs.nodit.io/web3-api/token)

### Twilio Resources
- [Twilio WhatsApp API](https://www.twilio.com/docs/whatsapp)

## 🚀 Deployment

### Using Heroku
```bash
# Install Heroku CLI
npm install -g heroku

# Create Heroku app
heroku create wallybot-app

# Set environment variables
heroku config:set TWILIO_ACCOUNT_SID=your_sid
heroku config:set TWILIO_AUTH_TOKEN=your_token
heroku config:set NODIT_API_KEY=your_key

# Deploy
git push heroku main
```

### Using Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📊 Monitoring

The bot includes comprehensive logging and monitoring:

- Request/response logging
- Error tracking
- Performance metrics
- Rate limiting
- Health checks

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📧 Email: support@wallybot.com
- 💬 Discord: [Join our community](https://discord.gg/wallybot)
- 📖 Documentation: [docs.wallybot.com](https://docs.wallybot.com)

## 🙏 Acknowledgments

- [Nodit](https://nodit.io) for Web3 infrastructure
- [Twilio](https://twilio.com) for WhatsApp API
- [OpenAI](https://openai.com) for AI capabilities

---

Built with ❤️ by [Sambit Sargam Ekalabya](https://github.com/sambitsargam)
