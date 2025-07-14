#!/bin/bash

export AZURE_AI_PROJECT_ENDPOINT="https://nasim-md2rc5mr-swedencentral.services.ai.azure.com"
export AZURE_AI_INFERENCE_API_KEY="ELZNMprUOSEn0g3uhj0MasZNzxwblKI5YK22N0GavSur7TBALlVgJQQJ99BGACfhMk5XJ3w3AAAAACOGHYiF"
export AZURE_AI_SERVICES_ENDPOINT="https://nasim-md2rc5mr-swedencentral.cognitiveservices.azure.com/"
export AZURE_SPEECH_STT_ENDPOINT="https://swedencentral.stt.speech.microsoft.com"
export AZURE_SPEECH_TTS_ENDPOINT="https://swedencentral.tts.speech.microsoft.com"
export AZURE_REGION="swedencentral"

cd /Users/freelancernasim/azure-ai-foundry-mcp

echo "🧪 Testing Azure AI Projects MCP Server..."
echo ""

# Test 1: Get Model Info
echo "📋 Test 1: Get Model Info"
echo '{"jsonrpc":"2.0","method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0.0"}},"id":1}' | node dist/server.js &
SERVER_PID=$!
sleep 2
echo '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"get_model_info","arguments":{"detailed":true}},"id":2}' | node dist/server.js 2>/dev/null | tail -1 | jq -r '.result.content[0].text' | jq '.deployments' 2>/dev/null || echo "No deployments found or error occurred"
kill $SERVER_PID 2>/dev/null

echo ""
echo "🔧 Test 2: Chat Completion"
echo '{"jsonrpc":"2.0","method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0.0"}},"id":1}' | node dist/server.js &
SERVER_PID=$!
sleep 2
echo '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"ask_azure_ai","arguments":{"query":"Hello, what can you help me with?"}},"id":3}' | node dist/server.js 2>/dev/null | tail -1 | jq -r '.result.content[0].text' | head -5
kill $SERVER_PID 2>/dev/null

echo ""
echo "✅ Test completed!"
