import { z } from 'zod';
import { NascoderAzureAIClient } from '../azure/client.js';
import { IntentAnalyzer } from '../routing/intent-analyzer.js';
import { AzureAIDiscovery } from '../azure/discovery.js';

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: z.ZodSchema;
  handler: (params: any) => Promise<any>;
}

export class AzureAITools {
  private queryHistory: string[] = [];

  constructor(
    private azureClient: NascoderAzureAIClient,
    private intentAnalyzer: IntentAnalyzer,
    private discovery: AzureAIDiscovery
  ) {}

  getAllTools(): MCPTool[] {
    return [
      this.createAskAzureAITool(),
      this.createAnalyzeImageTool(),
      this.createTranslateTextTool(),
      this.createAnalyzeDocumentTool(),
      this.createCheckContentSafetyTool(),
      this.createAnalyzeLanguageTool(),
      this.createListCapabilitiesTool(),
      this.createHealthCheckTool(),
      this.createGetModelInfoTool()
    ];
  }

  private createAskAzureAITool(): MCPTool {
    return {
      name: 'ask_azure_ai',
      description: 'Intelligent Azure AI assistant that automatically routes queries to the best available service',
      inputSchema: z.object({
        query: z.string().describe('Your question or request'),
        context: z.string().optional().describe('Additional context for the query'),
        forceService: z.enum(['chat', 'vision', 'speech', 'translation', 'document', 'safety', 'language']).optional().describe('Force a specific service instead of auto-routing')
      }),
      handler: async (params) => {
        const { query, context, forceService } = params;
        
        // Add to query history
        this.queryHistory.push(query);
        if (this.queryHistory.length > 10) {
          this.queryHistory.shift(); // Keep only last 10 queries
        }

        try {
          let intent;
          if (forceService) {
            intent = {
              type: forceService,
              confidence: 1.0,
              reasoning: `Forced to use ${forceService} service`,
              suggestedService: forceService === 'chat' ? 'models' : forceService
            };
          } else {
            intent = this.intentAnalyzer.analyzeIntentWithContext(query, this.queryHistory.slice(-3));
          }

          const fullQuery = context ? `${context}\n\nQuery: ${query}` : query;
          let result: any;

          switch (intent.type) {
            case 'vision':
              // Check if query contains image URL or reference
              const imageUrlMatch = query.match(/https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|bmp)/i);
              if (imageUrlMatch) {
                result = await this.azureClient.analyzeImage(imageUrlMatch[0]);
                return this.formatResponse('Vision Analysis', result, intent);
              } else {
                return this.formatResponse('Vision Service', 'Please provide an image URL to analyze', intent);
              }

            case 'translation':
              // Extract target language from query
              const langMatch = query.match(/to\s+(\w+)/i);
              const targetLang = langMatch ? langMatch[1].toLowerCase() : 'en';
              const textToTranslate = query.replace(/translate|to\s+\w+/gi, '').trim();
              
              if (textToTranslate) {
                result = await this.azureClient.translateText(textToTranslate, targetLang);
                return this.formatResponse('Translation', result, intent);
              } else {
                return this.formatResponse('Translation Service', 'Please provide text to translate', intent);
              }

            case 'document':
              const docUrlMatch = query.match(/https?:\/\/[^\s]+\.(pdf|doc|docx)/i);
              if (docUrlMatch) {
                result = await this.azureClient.analyzeDocument(docUrlMatch[0]);
                return this.formatResponse('Document Analysis', result, intent);
              } else {
                return this.formatResponse('Document Service', 'Please provide a document URL to analyze', intent);
              }

            case 'safety':
              const textToCheck = query.replace(/check|safety|safe|harmful/gi, '').trim();
              if (textToCheck) {
                result = await this.azureClient.checkContentSafety(textToCheck);
                return this.formatResponse('Content Safety', result, intent);
              } else {
                return this.formatResponse('Content Safety', 'Please provide text to check for safety', intent);
              }

            case 'language':
              const textToAnalyze = query.replace(/analyze|sentiment|language/gi, '').trim();
              if (textToAnalyze) {
                result = await this.azureClient.analyzeLanguage(textToAnalyze);
                return this.formatResponse('Language Analysis', result, intent);
              } else {
                return this.formatResponse('Language Service', 'Please provide text to analyze', intent);
              }

            case 'speech':
              return this.formatResponse('Speech Service', 'Speech services require audio data upload (not yet implemented in this demo)', intent);

            case 'chat':
            default:
              const messages = [
                { role: 'system', content: 'You are a helpful AI assistant powered by Azure AI Foundry.' },
                { role: 'user', content: fullQuery }
              ];
              result = await this.azureClient.nascoder_chatCompletion(messages);
              return this.formatResponse('Azure AI Chat', result, intent);
          }
        } catch (error) {
          return {
            error: true,
            message: `Error processing query: ${error instanceof Error ? error.message : 'Unknown error'}`,
            query,
            timestamp: new Date().toISOString()
          };
        }
      }
    };
  }

  private createAnalyzeImageTool(): MCPTool {
    return {
      name: 'analyze_image',
      description: 'Analyze images using Azure AI Vision service',
      inputSchema: z.object({
        imageUrl: z.string().url().describe('URL of the image to analyze'),
        features: z.array(z.enum(['caption', 'tags', 'objects', 'text'])).optional().describe('Specific features to analyze')
      }),
      handler: async (params) => {
        const result = await this.azureClient.analyzeImage(params.imageUrl);
        return this.formatResponse('Image Analysis', result);
      }
    };
  }

  private createTranslateTextTool(): MCPTool {
    return {
      name: 'translate_text',
      description: 'Translate text using Azure AI Translator service',
      inputSchema: z.object({
        text: z.string().describe('Text to translate'),
        targetLanguage: z.string().describe('Target language code (e.g., "fr", "es", "de")'),
        sourceLanguage: z.string().optional().describe('Source language code (auto-detected if not provided)')
      }),
      handler: async (params) => {
        const result = await this.azureClient.translateText(
          params.text, 
          params.targetLanguage, 
          params.sourceLanguage
        );
        return this.formatResponse('Translation', result);
      }
    };
  }

  private createAnalyzeDocumentTool(): MCPTool {
    return {
      name: 'analyze_document',
      description: 'Analyze documents using Azure AI Document Intelligence service',
      inputSchema: z.object({
        documentUrl: z.string().url().describe('URL of the document to analyze'),
        modelId: z.string().optional().describe('Document model to use (default: prebuilt-layout)')
      }),
      handler: async (params) => {
        const result = await this.azureClient.analyzeDocument(params.documentUrl);
        return this.formatResponse('Document Analysis', result);
      }
    };
  }

  private createCheckContentSafetyTool(): MCPTool {
    return {
      name: 'check_content_safety',
      description: 'Check content safety using Azure AI Content Safety service',
      inputSchema: z.object({
        text: z.string().describe('Text content to check for safety'),
        categories: z.array(z.enum(['Hate', 'SelfHarm', 'Sexual', 'Violence'])).optional().describe('Specific categories to check')
      }),
      handler: async (params) => {
        const result = await this.azureClient.checkContentSafety(params.text);
        return this.formatResponse('Content Safety Check', result);
      }
    };
  }

  private createAnalyzeLanguageTool(): MCPTool {
    return {
      name: 'analyze_language',
      description: 'Analyze text using Azure AI Language service',
      inputSchema: z.object({
        text: z.string().describe('Text to analyze'),
        features: z.array(z.enum(['sentiment', 'entities', 'keyPhrases', 'language'])).optional().describe('Analysis features to include')
      }),
      handler: async (params) => {
        const result = await this.azureClient.analyzeLanguage(params.text);
        return this.formatResponse('Language Analysis', result);
      }
    };
  }

  private createListCapabilitiesTool(): MCPTool {
    return {
      name: 'list_capabilities',
      description: 'List all available Azure AI services and their capabilities',
      inputSchema: z.object({
        includeHealth: z.boolean().optional().describe('Include health status of services')
      }),
      handler: async (params) => {
        const services = this.discovery.getAllServices();
        const healthChecks = params.includeHealth ? this.discovery.getHealthChecks() : [];
        
        return {
          services: services.map(service => ({
            name: service.name,
            status: service.status,
            capabilities: service.capabilities,
            endpoint: service.endpoint.replace(/\/+$/, ''), // Remove trailing slashes for display
            region: service.region
          })),
          healthChecks: healthChecks.map(check => ({
            service: check.service,
            status: check.status,
            responseTime: `${check.responseTime}ms`,
            lastChecked: check.lastChecked.toISOString()
          })),
          totalServices: services.length,
          availableServices: services.filter(s => s.status === 'available').length,
          timestamp: new Date().toISOString()
        };
      }
    };
  }

  private createHealthCheckTool(): MCPTool {
    return {
      name: 'health_check',
      description: 'Check the health status of all Azure AI services',
      inputSchema: z.object({
        refresh: z.boolean().optional().describe('Refresh health checks before returning results')
      }),
      handler: async (params) => {
        if (params.refresh) {
          await this.discovery.refreshHealthChecks();
        }
        
        const healthChecks = this.discovery.getHealthChecks();
        const services = this.discovery.getAllServices();
        
        return {
          overall: {
            status: healthChecks.every(h => h.status === 'healthy') ? 'healthy' : 'degraded',
            totalServices: services.length,
            healthyServices: healthChecks.filter(h => h.status === 'healthy').length,
            lastUpdated: new Date().toISOString()
          },
          services: healthChecks.map(check => ({
            name: check.service,
            status: check.status,
            responseTime: `${check.responseTime}ms`,
            lastChecked: check.lastChecked.toISOString(),
            error: check.error
          }))
        };
      }
    };
  }

  private createGetModelInfoTool(): MCPTool {
    return {
      name: 'get_model_info',
      description: 'Get information about deployed models in Azure AI Foundry',
      inputSchema: z.object({
        detailed: z.boolean().optional().describe('Include detailed model information')
      }),
      handler: async (params) => {
        const result = await this.azureClient.nascoder_getModelInfo();
        return this.formatResponse('Model Information', result);
      }
    };
  }

  private formatResponse(service: string, result: any, intent?: any): any {
    return {
      service,
      result,
      intent: intent ? {
        detectedType: intent.type,
        confidence: intent.confidence,
        reasoning: intent.reasoning
      } : undefined,
      timestamp: new Date().toISOString()
    };
  }
}
