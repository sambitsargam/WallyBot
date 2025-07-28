# WallyBot — WhatsApp Web3 Assistant 🪙

A WhatsApp chatbot built with Twilio and Node.js that connects to Nodit MCP and Web3 Data APIs to provide wallet, token, and NFT information through natural language queries.

## 🚀 Features

- 💬 Answer wallet/token/NFT queries via natural language
- 🔔 Send real-time alerts using Nodit's Webhook/Stream
- 🌐 Support for Ethereum & Polygon chains
- 🤖 Optional OpenAI integration for advanced NLP
- 📱 WhatsApp integration via Twilio

## 🛠️ Tech Stack

- **Backend**: Node.js + Express
- **Messaging**: Twilio WhatsApp API
- **Web3 Data**: Nodit MCP & Web3 APIs
- **AI**: OpenAI (optional)
- **Logging**: Winston

## 📋 Prerequisites

- Node.js >= 18.0.0
- Twilio Account with WhatsApp API access
- Nodit API Key
- OpenAI API Key (optional)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/sambitsargam/WallyBot.git
   cd WallyBot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Fill in your API keys and configuration in the `.env` file.

4. **Start the development server**
   ```bash
   npm run dev
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
