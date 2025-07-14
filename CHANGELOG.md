# Changelog

All notable changes to this project will be documented in this file.

## [2.1.0] - 2025-07-14

### 🚀 Major Fixes - Production Ready Vision & Document Services

#### Fixed
- **Vision Analysis**: Fixed Azure Computer Vision API integration
  - Now uses correct `/vision/v3.2/analyze` endpoint
  - Returns real image analysis instead of demo responses
  - Added support for categories, faces, color, and image type analysis
  - Proper error handling with detailed error messages

- **Document Analysis**: Fixed Azure Form Recognizer API integration
  - Now uses correct `/formrecognizer/documentModels/prebuilt-layout:analyze` endpoint
  - Implements proper polling mechanism for long-running operations
  - Returns real document analysis instead of demo responses
  - Added support for paragraphs and improved table extraction

- **Translation Service**: Enhanced Azure Translator API
  - Added proper region header for multi-service accounts
  - Improved error handling and logging
  - Better language detection confidence reporting

- **Language Analysis**: Fixed Azure Language API integration
  - Proper sentiment analysis with sentence-level breakdown
  - Enhanced response structure with warnings and detailed scores
  - Real-time language processing instead of demo responses

- **Content Safety**: Enhanced Azure Content Safety API
  - Improved category analysis reporting
  - Better blocklist matching detection
  - Enhanced error reporting for policy violations

#### Enhanced
- **Error Handling**: All services now throw proper errors instead of returning demo data
- **Logging**: Added comprehensive console logging for debugging
- **Type Safety**: Updated TypeScript interfaces for new response structures
- **API Compatibility**: Updated to latest stable API versions

#### Technical Improvements
- Added `@types/node` for better TypeScript support
- Enhanced error response formatting with context and suggestions
- Improved timeout handling for long-running operations
- Better endpoint URL normalization

### 🔧 Breaking Changes
- Services now throw errors on failure instead of returning demo responses
- Updated response structures for vision and document analysis
- Enhanced error response format with additional context

### 📋 Migration Guide
- Update error handling code to catch thrown exceptions
- Review response structure changes for vision and document analysis
- Test all integrations with real Azure services

---

## [2.0.1] - 2025-07-14

### Initial Release
- Basic Azure AI Foundry MCP Server implementation
- Demo responses for vision and document services
- Working chat, translation, and content safety services

---

**Note**: Version 2.1.0 represents a major quality improvement, moving from demo responses to full production-ready Azure AI service integration.
