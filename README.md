# 🛡️ NasCoder Azure AI MCP Server

**Professional Azure AI Integration for Model Context Protocol**

## 🎯 Overview

A comprehensive Model Context Protocol (MCP) server that provides seamless integration with Azure AI services. Built for production use with intelligent routing and comprehensive error handling.

## ✅ Available Tools

1. **`ask_azure_ai`** - Intelligent chat with auto-routing to best available model
2. **`get_model_info`** - Real-time model deployment information  
3. **`health_check`** - Service health monitoring and diagnostics
4. **`list_capabilities`** - Available capabilities and features
5. **`analyze_image`** - Computer vision analysis
6. **`translate_text`** - Multi-language text translation
7. **`check_content_safety`** - Content moderation and safety analysis
8. **`analyze_language`** - Language detection and sentiment analysis
9. **`analyze_document`** - Document intelligence and analysis

## 🚀 Installation

```bash
npm install nascoder-azure-ai-mcp
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file with your Azure credentials:

```env
AZURE_AI_INFERENCE_API_KEY=your_azure_api_key_here
AZURE_AI_INFERENCE_ENDPOINT=https://your-endpoint.cognitiveservices.azure.com/
AZURE_AI_PROJECTS_CONNECTION_STRING=your_connection_string_here
```

### MCP Client Integration

Add to your MCP client configuration:

```json
{
  "mcpServers": {
    "nascoder-azure-ai": {
      "command": "npx",
      "args": ["nascoder-azure-ai-mcp"],
      "env": {
        "AZURE_AI_INFERENCE_API_KEY": "your_api_key_here",
        "AZURE_AI_INFERENCE_ENDPOINT": "your_endpoint_here"
      }
    }
  }
}
```

## 🔧 Usage Examples

### Basic Chat
```javascript
{
  "query": "Explain quantum computing",
  "context": "Educational content for beginners"
}
```

### Image Analysis
```javascript
{
  "imageUrl": "https://example.com/image.jpg",
  "features": "objects,text,faces"
}
```

### Text Translation
```javascript
{
  "text": "Hello world",
  "targetLanguage": "es"
}
```

## 🛡️ Security Features

- Environment variable based configuration
- No hardcoded credentials
- Comprehensive error handling
- Rate limiting and retry logic
- Input validation and sanitization

## 📋 Requirements

- Node.js >= 18.0.0
- Valid Azure AI services subscription
- Azure AI Foundry access

## 🔗 Links

- **Repository**: [GitHub](https://github.com/freelancernasimofficial/nascoder-azure-ai-foundry-mcp)
- **Issues**: [GitHub Issues](https://github.com/freelancernasimofficial/nascoder-azure-ai-foundry-mcp/issues)
- **NPM**: [Package](https://www.npmjs.com/package/nascoder-azure-ai-mcp)

## 📄 License

MIT License - see LICENSE file for details.
