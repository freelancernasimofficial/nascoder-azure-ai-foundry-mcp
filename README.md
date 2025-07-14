# 🚀 Nascoder Azure AI Foundry MCP Server

**The first AI Foundry Project and Resources MCP Server - Developed by Freelancer Nasim**

[![npm version](https://badge.fury.io/js/nascoder-azure-ai-foundry-mcp.svg)](https://badge.fury.io/js/nascoder-azure-ai-foundry-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)

An intelligent Model Context Protocol (MCP) server that provides seamless integration with Azure AI Foundry projects and resources. Features auto-routing capabilities, multi-service integration, and intelligent intent detection.

## ✨ Features

### 🧠 **Intelligent Auto-Routing**
- **Smart Intent Detection**: Automatically routes queries to the most appropriate Azure AI service
- **Context-Aware Processing**: Understands query context and selects optimal tools
- **Graceful Fallbacks**: Seamlessly handles service unavailability with intelligent alternatives

### 🔧 **Multi-Service Integration**
- **Azure AI Foundry Models**: Direct integration with deployed models (GPT, Phi, Llama, DALL-E)
- **Cognitive Services**: Vision, Language, Translation, Document Intelligence
- **Content Safety**: Automated content moderation and safety checks
- **Speech Services**: Text-to-Speech and Speech-to-Text capabilities

### 🎯 **Available Tools**
1. `ask_azure_ai` - Chat with deployed AI models
2. `analyze_image` - Computer vision and image analysis
3. `translate_text` - Multi-language text translation
4. `analyze_document` - Document processing and extraction
5. `check_content_safety` - Content moderation and safety
6. `analyze_language` - Sentiment analysis and language processing
7. `list_capabilities` - Show all available capabilities
8. `health_check` - Service health monitoring
9. `get_model_info` - Model deployment information

## 🚀 Quick Start

### Installation

```bash
npm install -g nascoder-azure-ai-foundry-mcp
```

### Configuration

1. **Copy environment template:**
```bash
cp .env.example .env
```

2. **Configure your Azure credentials:**
```env
AZURE_AI_PROJECT_ENDPOINT=https://your-project.cognitiveservices.azure.com
AZURE_AI_INFERENCE_API_KEY=your-azure-ai-api-key
AZURE_AI_SERVICES_ENDPOINT=https://your-project.cognitiveservices.azure.com/
AZURE_REGION=your-azure-region
```

### Usage

#### As a Standalone Server
```bash
nascoder-azure-ai-mcp
```

#### With Amazon Q CLI
Add to your MCP configuration:
```json
{
  "mcpServers": {
    "nascoder-azure-ai": {
      "command": "nascoder-azure-ai-mcp",
      "env": {
        "AZURE_AI_PROJECT_ENDPOINT": "your-endpoint",
        "AZURE_AI_INFERENCE_API_KEY": "your-key"
      }
    }
  }
}
```

## 🎯 Intelligent Auto-Routing Examples

The server automatically detects intent and routes to appropriate services:

### Chat Queries
```
Query: "What is artificial intelligence?"
→ Routes to: Azure AI Chat Models
→ Response: Comprehensive AI explanation
```

### Translation Requests
```
Query: "translate Hello world to French"
→ Routes to: Azure Translator Service
→ Response: "Bonjour le monde"
```

### Vision Analysis
```
Query: "analyze this image https://example.com/photo.jpg"
→ Routes to: Azure Computer Vision
→ Response: Detailed image analysis with tags, objects, and text
```

### Document Processing
```
Query: "analyze this document https://example.com/doc.pdf"
→ Routes to: Azure Document Intelligence
→ Response: Extracted content, tables, and key-value pairs
```

### Content Safety
```
Query: "check if this text is safe: Hello everyone!"
→ Routes to: Azure Content Safety
→ Response: Safety analysis with category scores
```

## 🏗️ Architecture

### Core Components

- **NascoderAzureAIClient**: Main Azure AI integration client
- **IntentAnalyzer**: Smart query routing and intent detection
- **AzureAITools**: MCP tool implementations
- **AzureAIDiscovery**: Service discovery and health monitoring

### Supported Azure Services

- ✅ **Azure AI Foundry Models** (GPT, Phi, Llama, DALL-E)
- ✅ **Azure Computer Vision** (Image analysis, OCR)
- ✅ **Azure Translator** (Multi-language translation)
- ✅ **Azure Document Intelligence** (Document processing)
- ✅ **Azure Content Safety** (Content moderation)
- ✅ **Azure Language** (Sentiment analysis, NLP)
- ✅ **Azure Speech Services** (TTS, STT)

## 🔧 Development

### Prerequisites
- Node.js ≥ 18.0.0
- Azure AI Foundry project with deployed models
- Azure Cognitive Services subscription

### Local Development
```bash
git clone https://github.com/freelancernasim/nascoder-azure-ai-foundry-mcp.git
cd nascoder-azure-ai-foundry-mcp
npm install
npm run build
npm run dev
```

### Testing
```bash
npm test
```

## 📚 API Reference

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `AZURE_AI_PROJECT_ENDPOINT` | Azure AI Foundry project endpoint | ✅ |
| `AZURE_AI_INFERENCE_API_KEY` | Azure AI API key | ✅ |
| `AZURE_AI_SERVICES_ENDPOINT` | Cognitive Services endpoint | ✅ |
| `AZURE_REGION` | Azure region | ✅ |
| `AZURE_SPEECH_STT_ENDPOINT` | Speech-to-Text endpoint | ❌ |
| `AZURE_SPEECH_TTS_ENDPOINT` | Text-to-Speech endpoint | ❌ |

### MCP Tools

#### `ask_azure_ai`
Chat with Azure AI models with intelligent routing.

**Parameters:**
- `query` (string): The question or prompt
- `deployment` (string, optional): Specific model deployment name

#### `analyze_image`
Analyze images using Azure Computer Vision.

**Parameters:**
- `imageUrl` (string): URL of the image to analyze

#### `translate_text`
Translate text between languages.

**Parameters:**
- `text` (string): Text to translate
- `targetLanguage` (string): Target language code
- `sourceLanguage` (string, optional): Source language code

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Freelancer Nasim**
- GitHub: [@freelancernasim](https://github.com/freelancernasim)
- Email: contact@freelancernasim.com

## 🙏 Acknowledgments

- Microsoft Azure AI team for the excellent AI services
- Model Context Protocol community
- Amazon Q team for the MCP integration

## 🔗 Links

- [NPM Package](https://www.npmjs.com/package/nascoder-azure-ai-foundry-mcp)
- [GitHub Repository](https://github.com/freelancernasim/nascoder-azure-ai-foundry-mcp)
- [Azure AI Foundry Documentation](https://learn.microsoft.com/en-us/azure/ai-studio/)
- [Model Context Protocol](https://modelcontextprotocol.io/)

---

**Made with ❤️ by Freelancer Nasim | The first Azure AI Foundry MCP Server**
