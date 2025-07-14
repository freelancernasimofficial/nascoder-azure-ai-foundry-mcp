import axios from 'axios';
import { AzureAIService, ModelDeployment, ServiceHealthCheck } from '../types/azure.js';

export class AzureAIDiscovery {
  private services: Map<string, AzureAIService> = new Map();
  private healthChecks: Map<string, ServiceHealthCheck> = new Map();

  constructor(
    private inferenceEndpoint: string,
    private apiKey: string,
    private servicesEndpoint: string,
    private speechSTTEndpoint: string,
    private speechTTSEndpoint: string,
    private region: string
  ) {}

  async discoverServices(): Promise<AzureAIService[]> {
    console.log('🔍 Discovering Azure AI services...');

    // Define available services based on your setup
    const serviceDefinitions = [
      {
        name: 'Azure AI Speech',
        endpoint: this.speechSTTEndpoint,
        capabilities: ['speech-to-text', 'text-to-speech', 'speech-translation'],
        type: 'speech'
      },
      {
        name: 'Azure AI Vision',
        endpoint: this.servicesEndpoint,
        capabilities: ['image-analysis', 'ocr', 'object-detection'],
        type: 'vision'
      },
      {
        name: 'Azure AI Document Intelligence',
        endpoint: this.servicesEndpoint,
        capabilities: ['document-analysis', 'form-recognition', 'table-extraction'],
        type: 'document'
      },
      {
        name: 'Azure AI Language',
        endpoint: this.servicesEndpoint,
        capabilities: ['text-analysis', 'sentiment-analysis', 'entity-recognition'],
        type: 'language'
      },
      {
        name: 'Azure AI Translator',
        endpoint: this.servicesEndpoint,
        capabilities: ['text-translation', 'language-detection'],
        type: 'translation'
      },
      {
        name: 'Azure AI Content Safety',
        endpoint: this.servicesEndpoint,
        capabilities: ['content-moderation', 'harmful-content-detection'],
        type: 'safety'
      },
      {
        name: 'Azure AI Content Understanding',
        endpoint: this.servicesEndpoint,
        capabilities: ['content-analysis', 'content-classification'],
        type: 'understanding'
      },
      {
        name: 'Azure AI Model Router',
        endpoint: this.inferenceEndpoint,
        capabilities: ['chat-completion', 'text-generation', 'function-calling'],
        type: 'models'
      }
    ];

    // Check each service
    for (const serviceDef of serviceDefinitions) {
      try {
        const healthCheck = await this.checkServiceHealth(serviceDef.name, serviceDef.endpoint);
        
        const service: AzureAIService = {
          name: serviceDef.name,
          endpoint: serviceDef.endpoint,
          apiKey: this.apiKey,
          region: this.region,
          capabilities: serviceDef.capabilities,
          status: healthCheck.status === 'healthy' ? 'available' : 'unavailable'
        };

        this.services.set(serviceDef.type, service);
        this.healthChecks.set(serviceDef.name, healthCheck);
        
        console.log(`✅ ${serviceDef.name}: ${service.status}`);
      } catch (error) {
        console.log(`❌ ${serviceDef.name}: unavailable`);
        
        const service: AzureAIService = {
          name: serviceDef.name,
          endpoint: serviceDef.endpoint,
          region: this.region,
          capabilities: serviceDef.capabilities,
          status: 'unavailable'
        };
        
        this.services.set(serviceDef.type, service);
      }
    }

    return Array.from(this.services.values());
  }

  async discoverModels(): Promise<ModelDeployment[]> {
    console.log('🔍 Discovering deployed models...');
    
    try {
      // For now, we know about model-router deployment
      // In a full implementation, this would query the Azure AI Foundry API
      const models: ModelDeployment[] = [
        {
          name: 'model-router',
          modelName: 'model-router',
          version: '2025-05-19',
          endpoint: this.inferenceEndpoint,
          capabilities: [
            { type: 'chat', description: 'Chat completion with various models' },
            { type: 'text-generation', description: 'Text generation capabilities' },
            { type: 'function-calling', description: 'Function calling support' }
          ],
          status: 'ready'
        }
      ];

      console.log(`✅ Found ${models.length} deployed model(s)`);
      return models;
    } catch (error) {
      console.error('❌ Failed to discover models:', error);
      return [];
    }
  }

  private async checkServiceHealth(serviceName: string, endpoint: string): Promise<ServiceHealthCheck> {
    const startTime = Date.now();
    
    try {
      // Simple health check - try to reach the endpoint
      const response = await axios.get(endpoint, {
        timeout: 5000,
        headers: {
          'Ocp-Apim-Subscription-Key': this.apiKey,
          'Content-Type': 'application/json'
        },
        validateStatus: (status) => status < 500 // Accept 4xx as "healthy" (auth issues are expected)
      });

      const responseTime = Date.now() - startTime;
      
      return {
        service: serviceName,
        status: 'healthy',
        responseTime,
        lastChecked: new Date()
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      return {
        service: serviceName,
        status: 'unhealthy',
        responseTime,
        lastChecked: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  getService(type: string): AzureAIService | undefined {
    return this.services.get(type);
  }

  getAllServices(): AzureAIService[] {
    return Array.from(this.services.values());
  }

  getHealthChecks(): ServiceHealthCheck[] {
    return Array.from(this.healthChecks.values());
  }

  async refreshHealthChecks(): Promise<void> {
    console.log('🔄 Refreshing service health checks...');
    
    for (const [type, service] of this.services.entries()) {
      try {
        const healthCheck = await this.checkServiceHealth(service.name, service.endpoint);
        this.healthChecks.set(service.name, healthCheck);
        
        // Update service status
        service.status = healthCheck.status === 'healthy' ? 'available' : 'unavailable';
        this.services.set(type, service);
      } catch (error) {
        console.error(`Failed to check health for ${service.name}:`, error);
      }
    }
  }
}
