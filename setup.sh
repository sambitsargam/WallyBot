#!/bin/bash

echo "🪙 WallyBot Setup Script"
echo "========================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚙️ Creating .env file from template..."
    cp .env.example .env
    echo "📝 Please edit .env file with your API keys:"
    echo "   - TWILIO_ACCOUNT_SID"
    echo "   - TWILIO_AUTH_TOKEN"
    echo "   - TWILIO_PHONE_NUMBER"
    echo "   - NODIT_API_KEY"
    echo "   - OPENAI_API_KEY (optional)"
else
    echo "✅ .env file already exists"
fi

# Create logs directory if it doesn't exist
mkdir -p logs
echo "✅ Logs directory created"

# Run tests
echo "🧪 Running tests..."
npm test

if [ $? -eq 0 ]; then
    echo "✅ All tests passed!"
else
    echo "⚠️ Some tests failed. Check the output above."
fi

echo ""
echo "🚀 Setup complete! Next steps:"
echo "1. Edit .env file with your API keys"
echo "2. Run 'npm run dev' to start development server"
echo "3. Configure Twilio webhook URL to point to your server"
echo "4. Test by sending a WhatsApp message!"
echo ""
echo "📖 Documentation: docs/README.md"
echo "🆘 Support: https://github.com/sambitsargam/WallyBot/issues"
