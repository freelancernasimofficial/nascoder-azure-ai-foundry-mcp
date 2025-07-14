# 🛡️ Nascoder Azure AI Foundry MCP Server v2.0

**Professional Azure AI Integration - Thoroughly Tested & Production Ready**

*Developed by [Freelancer Nasim](https://github.com/freelancernasimofficial) with comprehensive testing and security best practices.*

## 🎯 **What This Package Delivers**

A **bulletproof** Model Context Protocol (MCP) server that provides seamless integration with Azure AI services. Every tool is **manually tested** and **production-ready**.

### ✅ **9 Fully Tested Tools:**

1. **`ask_azure_ai`** - Intelligent chat with auto-routing to best available model
2. **`get_model_info`** - Real-time model deployment information
3. **`health_check`** - Service health monitoring and diagnostics
4. **`list_capabilities`** - Available capabilities and features
5. **`analyze_image`** - Computer vision analysis (latest API v2024-02-01)
6. **`translate_text`** - Multi-language text translation
7. **`check_content_safety`** - Content moderation and safety analysis
8. **`analyze_language`** - Language detection and sentiment analysis
9. **`analyze_document`** - Document processing and text extraction

## 🚀 **Quick Start**

### **Installation**
```bash
npm install -g nascoder-azure-ai-mcp-server
```

### **Prerequisites**
You need your own Azure AI resources:
- Azure AI Project (AI Foundry)
- Azure Cognitive Services
- Valid API keys and endpoints

### **Environment Setup**
```bash
export AZURE_AI_PROJECT_ENDPOINT="your-azure-ai-project-endpoint"
export AZURE_AI_INFERENCE_API_KEY="your-azure-ai-api-key"
export AZURE_AI_SERVICES_ENDPOINT="your-azure-services-endpoint"
export AZURE_REGION="your-azure-region"
export AZURE_RESOURCE_GROUP="your-resource-group"
```

### **Amazon Q CLI Integration**
Add to `~/.aws/amazonq/mcp.json`:
```json
{
  "mcpServers": {
    "nascoder_azure_ai": {
      "command": "node",
      "args": [
        "/opt/homebrew/lib/node_modules/nascoder-azure-ai-mcp-server/dist/server.js"
      ],
      "env": {
        "AZURE_AI_PROJECT_ENDPOINT": "your-endpoint-here",
        "AZURE_AI_INFERENCE_API_KEY": "your-key-here",
        "AZURE_AI_SERVICES_ENDPOINT": "your-services-endpoint-here",
        "AZURE_REGION": "your-region-here",
        "AZURE_RESOURCE_GROUP": "your-resource-group-here"
      }
    }
  }
}
```

## 🔧 **Azure Setup Guide**

### **1. Create Azure AI Project**
1. Go to [Azure AI Foundry](https://ai.azure.com)
2. Create a new AI Project
3. Note your project endpoint

### **2. Get API Keys**
1. Navigate to your AI Project settings
2. Copy the API key and endpoint
3. Set up your environment variables

### **3. Deploy Models**
Deploy these models in your Azure AI Project:
- **GPT-4** or **GPT-3.5-turbo** for chat
- **GPT-4-vision** for image analysis
- **Text translation** service

## 🧪 **Quality Assurance**

### **API Version Updates (v2.0)**
- ✅ **Computer Vision**: Updated to `2024-02-01` (latest stable)
- ✅ **Document Intelligence**: Updated to `2024-07-31-preview`
- ✅ **Content Safety**: Updated to `2024-09-01`
- ✅ **Language Services**: Updated to `2023-04-01`
- ✅ **Translator**: Using stable `v3.0`

### **Security Features**
- ✅ No hardcoded credentials
- ✅ Environment variable based configuration
- ✅ Input sanitization
- ✅ Error handling and graceful failures

## 📊 **Tool Examples**

### **Basic Chat**
```javascript
// Tool: ask_azure_ai
{
  "query": "What is machine learning?",
  "model": "gpt-4" // optional
}
```

### **Image Analysis**
```javascript
// Tool: analyze_image
{
  "imageUrl": "https://example.com/image.jpg"
}
```

### **Text Translation**
```javascript
// Tool: translate_text
{
  "text": "Hello world",
  "targetLanguage": "es",
  "sourceLanguage": "en" // optional
}
```

## 🛠️ **Troubleshooting**

### **Common Issues**

**Server won't start:**
- Check your Azure credentials
- Verify your Azure AI Project is active
- Ensure models are deployed

**API errors:**
- Verify your API keys are valid
- Check your Azure subscription status
- Ensure proper permissions

## 📞 **Support**

- **Issues**: [GitHub Issues](https://github.com/freelancernasimofficial/nascoder-azure-ai-foundry-mcp/issues)
- **Documentation**: [GitHub Wiki](https://github.com/freelancernasimofficial/nascoder-azure-ai-foundry-mcp/wiki)
- **Email**: contact@freelancernasim.com

## 📄 **License**

MIT License - See [LICENSE](LICENSE) file for details.

---

**🛡️ Built with pride by [Freelancer Nasim](https://github.com/freelancernasimofficial) - Where quality meets reliability!**

*Bring your own Azure resources and enjoy professional AI integration!*
