#!/bin/bash

export AZURE_AI_PROJECT_ENDPOINT="https://nasim-md2rc5mr-swedencentral.cognitiveservices.azure.com"
export AZURE_AI_INFERENCE_API_KEY="ELZNMprUOSEn0g3uhj0MasZNzxwblKI5YK22N0GavSur7TBALlVgJQQJ99BGACfhMk5XJ3w3AAAAACOGHYiF"
export AZURE_AI_SERVICES_ENDPOINT="https://nasim-md2rc5mr-swedencentral.cognitiveservices.azure.com/"
export AZURE_SPEECH_STT_ENDPOINT="https://swedencentral.stt.speech.microsoft.com"
export AZURE_SPEECH_TTS_ENDPOINT="https://swedencentral.tts.speech.microsoft.com"
export AZURE_REGION="swedencentral"
export AZURE_RESOURCE_GROUP="rg-openai-fnsoft"

cd /Users/freelancernasim/azure-ai-foundry-mcp

echo "🧪 Testing Azure AI Foundry MCP Server with REAL DEPLOYED MODELS..."
echo ""
echo "📋 Available Models:"
echo "  • model-router"
echo "  • Phi-4-multimodal-instruct"
echo "  • Llama-4-Maverick-17B-128E-Instruct-FP8"
echo "  • dall-e-3"
echo ""

# Test 1: Simple chat test
echo "🔧 Test 1: Chat with model-router"
timeout 15s bash -c '
(
echo "{\"jsonrpc\":\"2.0\",\"method\":\"initialize\",\"params\":{\"protocolVersion\":\"2024-11-05\",\"capabilities\":{},\"clientInfo\":{\"name\":\"test\",\"version\":\"1.0.0\"}},\"id\":1}"
sleep 3
echo "{\"jsonrpc\":\"2.0\",\"method\":\"tools/call\",\"params\":{\"name\":\"ask_azure_ai\",\"arguments\":{\"query\":\"Hello! Can you tell me what 2+2 equals?\"}},\"id\":2}"
) | node dist/server.js 2>/dev/null | tail -1 | jq -r ".result.content[0].text" 2>/dev/null | head -5
' || echo "Test 1 completed with timeout"

echo ""
echo "✅ Test completed! Check if the model responded correctly."
