const axios = require('axios');

// Example script to test WallyBot locally
// This simulates Twilio webhook calls

const BASE_URL = 'http://localhost:3000';

const testMessages = [
    {
        name: 'Help Command',
        body: 'help',
        from: 'whatsapp:+1234567890'
    },
    {
        name: 'Wallet Balance Query',
        body: 'Check balance for 0x742d35Cc4Bf86C6D8Ba9352532Fd1e42a5D9e69B',
        from: 'whatsapp:+1234567890'
    },
    {
        name: 'Token Info Query',
        body: 'What is USDC token?',
        from: 'whatsapp:+1234567890'
    },
    {
        name: 'Price Query',
        body: 'What\'s the price of ETH?',
        from: 'whatsapp:+1234567890'
    },
    {
        name: 'NFT Details Query',
        body: 'Show NFT details for 0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D #1234',
        from: 'whatsapp:+1234567890'
    }
];

async function testWebhook(message) {
    try {
        console.log(`\n🧪 Testing: ${message.name}`);
        console.log(`📱 Message: "${message.body}"`);
        
        const response = await axios.post(`${BASE_URL}/webhook`, {
            Body: message.body,
            From: message.from,
            MessageSid: `SM${Date.now()}`
        }, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            timeout: 10000
        });
        
        console.log(`✅ Status: ${response.status}`);
        console.log(`📤 Response: ${response.data}`);
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
        if (error.response) {
            console.log(`📊 Status: ${error.response.status}`);
            console.log(`📄 Data: ${JSON.stringify(error.response.data, null, 2)}`);
        }
    }
}

async function testHealthCheck() {
    try {
        console.log('\n🏥 Testing Health Check...');
        const response = await axios.get(`${BASE_URL}/health`);
        console.log('✅ Health Check Passed');
        console.log(`📊 Status: ${response.data.status}`);
        console.log(`⏱️  Uptime: ${response.data.uptime}s`);
    } catch (error) {
        console.log('❌ Health Check Failed');
        console.log(`Error: ${error.message}`);
    }
}

async function runTests() {
    console.log('🪙 WallyBot Local Testing');
    console.log('========================');
    
    // Test health check first
    await testHealthCheck();
    
    // Test webhook messages
    for (const message of testMessages) {
        await testWebhook(message);
        // Wait between tests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n✨ Testing completed!');
    console.log('\n💡 Tips:');
    console.log('- Make sure WallyBot server is running (npm run dev)');
    console.log('- Configure your .env file with valid API keys');
    console.log('- For production testing, use Twilio webhook simulator');
}

// Run tests if this file is executed directly
if (require.main === module) {
    runTests().catch(console.error);
}

module.exports = { testWebhook, testHealthCheck, runTests };
