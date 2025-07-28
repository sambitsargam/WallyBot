# 🧪 WallyBot Webhook Testing Guide

## ✅ Your Webhook URL is Working!

**Webhook URL**: `http://localhost:3000/webhook`  
**Status**: ✅ **ACTIVE** and responding successfully

## 🔍 How to Test Your Webhook

### 1. **Basic Server Status**

```bash
# Check if server is running
curl http://localhost:3000/

# Check health status
curl http://localhost:3000/health
```

**Expected Response**:
```json
{
  "name": "WallyBot",
  "description": "WhatsApp Web3 Assistant", 
  "version": "1.0.0",
  "endpoints": {
    "webhook": "/webhook",
    "health": "/health"
  }
}
```

### 2. **Test Webhook with Different Messages**

#### Help Command
```bash
curl -X POST http://localhost:3000/webhook \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "Body=help&From=whatsapp%3A%2B1234567890&MessageSid=SM1234567890"
```

#### Wallet Balance Query
```bash
curl -X POST http://localhost:3000/webhook \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "Body=Check%20balance%20for%200x742d35Cc4Bf86C6D8Ba9352532Fd1e42a5D9e69B&From=whatsapp%3A%2B1234567890&MessageSid=SM2234567890"
```

#### Token Information
```bash
curl -X POST http://localhost:3000/webhook \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "Body=What%20is%20USDC%20token?&From=whatsapp%3A%2B1234567890&MessageSid=SM3234567890"
```

#### NFT Details
```bash
curl -X POST http://localhost:3000/webhook \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "Body=Show%20NFT%20details%20for%200xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D%20%231234&From=whatsapp%3A%2B1234567890&MessageSid=SM4234567890"
```

#### Price Query
```bash
curl -X POST http://localhost:3000/webhook \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "Body=What's%20the%20price%20of%20ETH?&From=whatsapp%3A%2B1234567890&MessageSid=SM5234567890"
```

**All commands should return**: `OK`

### 3. **Using the Built-in Test Script**

```bash
# Run the comprehensive test suite
node test-local.js
```

This will test all endpoints and message types automatically.

### 4. **Monitor Server Logs**

Watch the terminal where you ran `npm run dev` to see:
- ✅ Message received logs
- ✅ Intent parsing results  
- ✅ Response generation
- ✅ Test mode indicators

**Example Log Output**:
```
2025-07-28 21:57:06 [info]: Received message from +1234567890: help
2025-07-28 21:57:06 [info]: Parsed intent:
2025-07-28 21:57:06 [info]: [TEST MODE] Would send message to +1234567890: 🪙 *WallyBot - Your Web3 Assistant*
```

## 🌐 For Production Testing

### 1. **Expose Local Server to Internet**

Using ngrok (recommended):
```bash
# Install ngrok
npm install -g ngrok

# Expose port 3000
ngrok http 3000
```

This gives you a public URL like: `https://abc123.ngrok.io`  
Your webhook URL becomes: `https://abc123.ngrok.io/webhook`

### 2. **Deploy to Cloud Platforms**

#### Heroku
```bash
# Your webhook URL will be:
https://your-app-name.herokuapp.com/webhook
```

#### Railway
```bash
# Your webhook URL will be:
https://your-app-name.railway.app/webhook
```

#### Vercel/Netlify
```bash
# Your webhook URL will be:
https://your-app-name.vercel.app/webhook
```

## 🔧 Twilio Configuration

### 1. **Sandbox Setup (Testing)**
1. Go to [Twilio Console](https://console.twilio.com/)
2. Navigate to **Messaging** → **Try it out** → **Send a WhatsApp message**
3. Set webhook URL to: `https://your-domain.com/webhook`
4. Send `join <sandbox-keyword>` to your Twilio WhatsApp number

### 2. **Production Setup**
1. Apply for WhatsApp Business API access
2. Configure approved message templates
3. Set webhook URL in WhatsApp Business Account

## 🧪 Test Message Examples

| Intent | Example Message | Expected Response |
|--------|----------------|-------------------|
| **Help** | `help`, `commands` | Command list with examples |
| **Wallet Balance** | `Check balance for 0x742d35...` | Balance and USD value |
| **Token Info** | `What is USDC token?` | Token details and price |
| **NFT Details** | `Show NFT #1234 for 0x123...` | NFT metadata and owner |
| **Price Query** | `ETH price`, `What's BTC worth?` | Current price and 24h change |
| **Transaction** | `Show tx 0xabc123...` | Transaction details |

## 🔍 Troubleshooting

### Common Issues

#### 1. **Server Not Starting**
```bash
# Check if port 3000 is in use
lsof -i :3000

# Kill process using port 3000
kill -9 $(lsof -t -i:3000)

# Restart server
npm run dev
```

#### 2. **Webhook Returns 500 Error**
- Check server logs for errors
- Verify environment variables in `.env`
- Test with simpler messages first

#### 3. **No Response from Webhook**
- Verify server is running: `curl http://localhost:3000/health`
- Check request format (URL encoding)
- Monitor server logs for incoming requests

#### 4. **Twilio Signature Validation Fails**
- Currently disabled in development mode
- For production, ensure `TWILIO_AUTH_TOKEN` is correct
- Verify webhook URL matches exactly

## 📊 Current Test Mode Features

✅ **Server Running**: Port 3000  
✅ **Webhook Active**: `/webhook` endpoint  
✅ **Message Processing**: Intent parsing works  
✅ **Response Generation**: Help and error messages  
✅ **Rate Limiting**: Active protection  
✅ **Logging**: Comprehensive request logging  

⚠️ **Test Mode Limitations**:
- No real Twilio messages sent (logged instead)
- No real Web3 API calls (use demo data)
- MCP integration disabled (fallback to Nodit API)

## 🚀 Next Steps

### 1. **Enable Real APIs**
```bash
# Uncomment and add real credentials in .env
TWILIO_ACCOUNT_SID=your_real_account_sid
TWILIO_AUTH_TOKEN=your_real_auth_token  
TWILIO_PHONE_NUMBER=your_real_whatsapp_number
NODIT_API_KEY=your_real_nodit_api_key
OPENAI_API_KEY=your_real_openai_key
```

### 2. **Deploy to Production**
```bash
# Deploy to Heroku
git push heroku main

# Or Railway
railway up

# Or Docker
docker-compose up -d
```

### 3. **Configure Twilio Webhook**
- Set webhook URL to your deployed domain
- Test with real WhatsApp messages
- Monitor production logs

## 🎯 Webhook URL Summary

- **Local Development**: `http://localhost:3000/webhook`
- **Ngrok Tunnel**: `https://abc123.ngrok.io/webhook`  
- **Production**: `https://your-domain.com/webhook`

Your webhook is **ready and working** in test mode! 🎉
