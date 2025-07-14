#!/bin/bash

echo "🔧 Setting up Azure AI Foundry environment variables..."

# Azure AI Foundry Configuration
export AZURE_AI_INFERENCE_ENDPOINT="https://nasim-md2rc5mr-swedencentral.services.ai.azure.com/models"
export AZURE_AI_INFERENCE_API_KEY="ELZNMprUOSEn0g3uhj0MasZNzxwblKI5YK22N0GavSur7TBALlVgJQQJ99BGACfhMk5XJ3w3AAAAACOGHYiF"
export AZURE_OPENAI_ENDPOINT="https://nasim-md2rc5mr-swedencentral.openai.azure.com/"
export AZURE_AI_SERVICES_ENDPOINT="https://nasim-md2rc5mr-swedencentral.cognitiveservices.azure.com/"
export AZURE_SPEECH_STT_ENDPOINT="https://swedencentral.stt.speech.microsoft.com"
export AZURE_SPEECH_TTS_ENDPOINT="https://swedencentral.tts.speech.microsoft.com"
export AZURE_REGION="swedencentral"

echo "✅ Environment variables set!"
echo ""
echo "To make these permanent, add them to your shell profile:"
echo "echo 'export AZURE_AI_INFERENCE_ENDPOINT=\"https://nasim-md2rc5mr-swedencentral.services.ai.azure.com/models\"' >> ~/.zshrc"
echo "echo 'export AZURE_AI_INFERENCE_API_KEY=\"ELZNMprUOSEn0g3uhj0MasZNzxwblKI5YK22N0GavSur7TBALlVgJQQJ99BGACfhMk5XJ3w3AAAAACOGHYiF\"' >> ~/.zshrc"
echo "echo 'export AZURE_AI_SERVICES_ENDPOINT=\"https://nasim-md2rc5mr-swedencentral.cognitiveservices.azure.com/\"' >> ~/.zshrc"
echo "echo 'export AZURE_SPEECH_STT_ENDPOINT=\"https://swedencentral.stt.speech.microsoft.com\"' >> ~/.zshrc"
echo "echo 'export AZURE_SPEECH_TTS_ENDPOINT=\"https://swedencentral.tts.speech.microsoft.com\"' >> ~/.zshrc"
echo "echo 'export AZURE_REGION=\"swedencentral\"' >> ~/.zshrc"
echo ""
echo "Then run: source ~/.zshrc"
