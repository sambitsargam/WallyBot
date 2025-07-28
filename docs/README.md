# WallyBot Documentation

## Table of Contents

1. [Getting Started](#getting-started)
2. [API Reference](#api-reference)
3. [Configuration](#configuration)
4. [Deployment](#deployment)
5. [Troubleshooting](#troubleshooting)

## Getting Started

### Prerequisites

- Node.js 18+ 
- Twilio Account with WhatsApp API
- Nodit API Key
- OpenAI API Key (optional)

### Quick Setup

1. **Clone and Install**
   ```bash
   git clone https://github.com/sambitsargam/WallyBot.git
   cd WallyBot
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

### Twilio WhatsApp Setup

1. **Create Twilio Account**
   - Sign up at [twilio.com](https://twilio.com)
   - Navigate to Console → Develop → Messaging → Try it out → Send a WhatsApp message

2. **Sandbox Configuration**
   - Join sandbox: Send `join <sandbox-keyword>` to your Twilio WhatsApp number
   - Configure webhook URL: `https://your-domain.com/webhook`

3. **Production Setup**
   - Apply for WhatsApp Business API access
   - Complete business verification
   - Configure approved templates

### Nodit MCP Integration

1. **API Key Setup**
   - Get your API key from [Nodit Console](https://console.nodit.io)
   - Add to `.env`: `NODIT_API_KEY=your_key_here`

2. **MCP Server Configuration**
   ```bash
   # Install Nodit MCP server (if available)
   npm install -g @nodit/mcp-server
   
   # Or use direct API calls (default implementation)
   ```

3. **Supported Endpoints**
   - Wallet balances
   - Token information
   - NFT details
   - Transaction data
   - Price feeds

## API Reference

### WhatsApp Commands

#### Wallet Balance
- **Command**: `Check balance for 0x742d35...`
- **Response**: Balance, USD value, top tokens

#### Token Information
- **Command**: `What is USDC token?`
- **Response**: Name, symbol, price, market cap

#### NFT Details
- **Command**: `Show NFT details for 0x123...def #1234`
- **Response**: Name, collection, owner, attributes

#### Price Query
- **Command**: `What's the price of ETH?`
- **Response**: Current price, 24h change, volume

#### Transaction Details
- **Command**: `Show transaction 0xabc...123`
- **Response**: Status, block, from/to, value, gas

#### Help
- **Command**: `help` or `commands`
- **Response**: Available commands and examples

### HTTP Endpoints

#### Health Check
```http
GET /health
```
**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-28T10:00:00.000Z",
  "uptime": 3600,
  "version": "1.0.0"
}
```

#### Webhook Endpoint
```http
POST /webhook
Content-Type: application/x-www-form-urlencoded
X-Twilio-Signature: signature_header

Body=message_text&From=whatsapp%3A%2B1234567890&MessageSid=SM123
```

## Configuration

### Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NODE_ENV` | No | Environment mode | `development` |
| `PORT` | No | Server port | `3000` |
| `TWILIO_ACCOUNT_SID` | Yes | Twilio Account SID | `AC123...` |
| `TWILIO_AUTH_TOKEN` | Yes | Twilio Auth Token | `abc123...` |
| `TWILIO_PHONE_NUMBER` | Yes | WhatsApp number | `+14155238886` |
| `NODIT_API_KEY` | Yes | Nodit API key | `nodit_...` |
| `NODIT_BASE_URL` | No | Nodit API base URL | `https://api.nodit.io` |
| `OPENAI_API_KEY` | No | OpenAI API key | `sk-...` |
| `RATE_LIMIT_WINDOW_MS` | No | Rate limit window | `900000` |
| `RATE_LIMIT_MAX_REQUESTS` | No | Max requests per window | `100` |

### Supported Blockchains

- **Ethereum** (`ethereum`, `eth`)
- **Polygon** (`polygon`, `matic`)

Additional chains can be added by:
1. Updating `supportedChains` in validators
2. Adding chain emojis in response formatter
3. Configuring Nodit API endpoints

### Rate Limiting

Default configuration:
- **Window**: 15 minutes
- **Max Requests**: 100 per window
- **Block Duration**: 5 minutes

Customize in `.env`:
```env
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Deployment

### Heroku

1. **Setup**
   ```bash
   # Install Heroku CLI
   npm install -g heroku
   
   # Create app
   heroku create wallybot-app
   ```

2. **Configure Environment**
   ```bash
   heroku config:set TWILIO_ACCOUNT_SID=your_sid
   heroku config:set TWILIO_AUTH_TOKEN=your_token
   heroku config:set NODIT_API_KEY=your_key
   ```

3. **Deploy**
   ```bash
   git push heroku main
   ```

4. **Configure Webhook**
   - Update Twilio webhook URL to: `https://wallybot-app.herokuapp.com/webhook`

### Railway

1. **Deploy**
   ```bash
   npm install -g @railway/cli
   railway login
   railway init
   railway up
   ```

2. **Environment Variables**
   - Add via Railway dashboard or CLI

### Docker

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY src/ ./src/
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

2. **Build and Run**
   ```bash
   docker build -t wallybot .
   docker run -p 3000:3000 --env-file .env wallybot
   ```

### Production Considerations

1. **Database Integration**
   - Add PostgreSQL/MongoDB for user data
   - Store conversation history
   - Cache API responses

2. **Monitoring**
   - Set up application monitoring (DataDog, New Relic)
   - Configure error tracking (Sentry)
   - Add health check endpoints

3. **Security**
   - Enable Twilio signature validation
   - Add API rate limiting per user
   - Implement user authentication

4. **Scaling**
   - Use Redis for rate limiting
   - Add horizontal scaling
   - Implement queue system for high traffic

## Troubleshooting

### Common Issues

#### Twilio Webhook Not Receiving Messages

**Symptoms:**
- No response from bot
- Webhook endpoint not called

**Solutions:**
1. Check webhook URL configuration in Twilio Console
2. Ensure HTTPS is used (required for production)
3. Verify server is accessible from internet
4. Check Twilio signature validation

#### Nodit API Errors

**Symptoms:**
- "Unable to fetch wallet balance"
- "Token not found" errors

**Solutions:**
1. Verify Nodit API key is correct
2. Check supported chains configuration
3. Validate wallet addresses/token formats
4. Review Nodit API rate limits

#### OpenAI Integration Issues

**Symptoms:**
- Fallback parsing always used
- Poor intent detection

**Solutions:**
1. Verify OpenAI API key
2. Check API quota/billing
3. Review prompt engineering
4. Test with simpler queries

#### Rate Limiting Problems

**Symptoms:**
- "Too many requests" errors
- Users getting blocked unexpectedly

**Solutions:**
1. Adjust rate limit configuration
2. Implement per-user limits
3. Add Redis for distributed rate limiting
4. Review user usage patterns

### Debug Mode

Enable debug logging:
```bash
NODE_ENV=development npm run dev
```

Check logs:
```bash
# Application logs
tail -f logs/combined.log

# Error logs
tail -f logs/error.log
```

### Testing

Run test suite:
```bash
# All tests
npm test

# With coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### Support

- **Issues**: [GitHub Issues](https://github.com/sambitsargam/WallyBot/issues)
- **Documentation**: [docs.wallybot.com](https://docs.wallybot.com)
- **Discord**: [Community Chat](https://discord.gg/wallybot)

### Performance Optimization

1. **Caching**
   - Cache token prices for 1 minute
   - Cache wallet balances for 30 seconds
   - Use Redis for production caching

2. **Response Time**
   - Implement response timeouts
   - Add circuit breakers for API calls
   - Use connection pooling

3. **Memory Management**
   - Monitor memory usage
   - Clear old rate limit data
   - Implement garbage collection tuning
