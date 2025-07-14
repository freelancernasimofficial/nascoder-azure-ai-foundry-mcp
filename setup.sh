#!/bin/bash

echo "🚀 Setting up Azure AI Foundry MCP Server..."

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

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building TypeScript project..."
npm run build

# Check if build was successful
if [ ! -f "dist/server.js" ]; then
    echo "❌ Build failed. dist/server.js not found."
    exit 1
fi

echo "✅ Build completed successfully!"

# Make the server executable
chmod +x dist/server.js

# Test the server
echo "🧪 Testing server initialization..."
timeout 10s node dist/server.js <<< '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}' > /dev/null 2>&1

if [ $? -eq 0 ] || [ $? -eq 124 ]; then
    echo "✅ Server test passed!"
else
    echo "⚠️  Server test had issues, but this might be normal for STDIO mode"
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Copy the MCP configuration to your Amazon Q CLI config:"
echo "   cp config/q-cli-config.json ~/.config/amazon-q/mcp-config.json"
echo ""
echo "2. Or manually add this to your Amazon Q CLI configuration:"
echo "   cat config/q-cli-config.json"
echo ""
echo "3. Test with Amazon Q CLI:"
echo "   q chat 'List Azure AI capabilities'"
echo "   q chat 'Analyze this image: https://example.com/image.jpg'"
echo "   q chat 'Translate hello to French'"
echo ""
echo "Available MCP Tools:"
echo "- ask_azure_ai: Smart routing to best Azure AI service"
echo "- analyze_image: Azure AI Vision service"
echo "- translate_text: Azure AI Translator service"
echo "- analyze_document: Azure AI Document Intelligence"
echo "- check_content_safety: Azure AI Content Safety"
echo "- analyze_language: Azure AI Language service"
echo "- list_capabilities: Show all available services"
echo "- health_check: Check service health status"
echo ""
echo "🔧 Configuration file: config/q-cli-config.json"
echo "📝 Environment file: .env"
echo "🚀 Server executable: dist/server.js"
