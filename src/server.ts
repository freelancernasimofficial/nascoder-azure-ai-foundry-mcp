#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { config } from 'dotenv';
import { NascoderAzureAIClient } from './azure/client.js';
import { AzureAIDiscovery } from './azure/discovery.js';
import { IntentAnalyzer } from './routing/intent-analyzer.js';
import { AzureAITools } from './tools/azure-tools.js';

// Load environment variables
config();

class NascoderAzureAIFoundryMCPServer {
  private server: Server;
  private azureClient: NascoderAzureAIClient;
  private discovery: AzureAIDiscovery;
  private intentAnalyzer: IntentAnalyzer;
  private tools: AzureAITools;

  constructor() {
    // Validate required environment variables
    this.validateEnvironment();

    // Initialize MCP Server
    this.server = new Server(
      {
        name: 'azure-ai-foundry-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
      }
    );

    // Initialize Azure components
    this.azureClient = new NascoderAzureAIClient(
      process.env.AZURE_AI_PROJECT_ENDPOINT!,
      process.env.AZURE_AI_INFERENCE_API_KEY!,
      process.env.AZURE_AI_SERVICES_ENDPOINT!,
      process.env.AZURE_REGION || 'eastus'
    );

    this.discovery = new AzureAIDiscovery(
      process.env.AZURE_AI_PROJECT_ENDPOINT!,
      process.env.AZURE_AI_INFERENCE_API_KEY!,
      process.env.AZURE_AI_SERVICES_ENDPOINT!,
      process.env.AZURE_SPEECH_STT_ENDPOINT!,
      process.env.AZURE_SPEECH_TTS_ENDPOINT!,
      process.env.AZURE_REGION!
    );

    this.intentAnalyzer = new IntentAnalyzer();
    this.tools = new AzureAITools(this.azureClient, this.intentAnalyzer, this.discovery);
  }

  private validateEnvironment(): void {
    const required = [
      'AZURE_AI_PROJECT_ENDPOINT',
      'AZURE_AI_INFERENCE_API_KEY',
      'AZURE_AI_SERVICES_ENDPOINT'
    ];

    const missing = required.filter(key => !process.env[key]);
    if (missing.length > 0) {
      console.error('❌ Missing required environment variables:', missing.join(', '));
      console.error('💡 Please set these in your .zshrc:');
      missing.forEach(key => console.error(`   export ${key}="YOUR_${key}"`));
      process.exit(1);
    }
  }

  async initialize(): Promise<void> {
    try {
      console.error('🚀 Starting Azure AI Foundry MCP Server...');
      
      // Discover Azure AI services
      await this.discovery.discoverServices();
      await this.discovery.discoverModels();
      
      // Setup MCP handlers
      this.setupHandlers();
      
      console.error('🎉 Server initialized successfully');
      console.error('📡 Ready to accept MCP requests via STDIO...');
      
    } catch (error) {
      console.error('❌ Failed to initialize server:', error);
      process.exit(1);
    }
  }

  private setupHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const tools = this.tools.getAllTools();
      console.error(`📋 Listed ${tools.length} available tools`);
      
      return {
        tools: tools.map(tool => ({
          name: tool.name,
          description: tool.description,
          inputSchema: this.zodToJsonSchema(tool.inputSchema),
        })),
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      console.error(`🔧 Calling tool: ${name}`);
      
      const tools = this.tools.getAllTools();
      const tool = tools.find(t => t.name === name);
      
      if (!tool) {
        throw new Error(`Tool '${name}' not found`);
      }

      try {
        // Validate input parameters
        const validatedArgs = tool.inputSchema.parse(args);
        
        // Execute tool
        const result = await tool.handler(validatedArgs);
        
        console.error(`✅ Tool ${name} executed successfully`);
        
        return {
          content: [
            {
              type: 'text',
              text: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        console.error(`❌ Tool ${name} failed:`, error);
        throw error;
      }
    });

    // List available resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return {
        resources: [
          {
            uri: 'azure://services',
            name: 'Azure AI Services',
            description: 'Information about available Azure AI services',
            mimeType: 'application/json',
          },
          {
            uri: 'azure://health',
            name: 'Service Health',
            description: 'Health status of Azure AI services',
            mimeType: 'application/json',
          },
        ],
      };
    });

    // Handle resource reads
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;
      
      switch (uri) {
        case 'azure://services':
          return {
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify({
                  services: this.discovery.getAllServices(),
                  timestamp: new Date().toISOString(),
                }, null, 2),
              },
            ],
          };
          
        case 'azure://health':
          return {
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify({
                  healthChecks: this.discovery.getHealthChecks(),
                  timestamp: new Date().toISOString(),
                }, null, 2),
              },
            ],
          };
          
        default:
          throw new Error(`Resource '${uri}' not found`);
      }
    });
  }

  private zodToJsonSchema(schema: any): any {
    // Simple Zod to JSON Schema conversion
    if (schema._def?.typeName === 'ZodObject') {
      const shape = schema._def.shape();
      const properties: any = {};
      const required: string[] = [];

      for (const [key, value] of Object.entries(shape)) {
        const zodValue = value as any;
        
        if (zodValue._def?.typeName === 'ZodString') {
          properties[key] = { 
            type: 'string',
            description: zodValue._def.description || undefined
          };
        } else if (zodValue._def?.typeName === 'ZodNumber') {
          properties[key] = { 
            type: 'number',
            description: zodValue._def.description || undefined
          };
        } else if (zodValue._def?.typeName === 'ZodBoolean') {
          properties[key] = { 
            type: 'boolean',
            description: zodValue._def.description || undefined
          };
        } else if (zodValue._def?.typeName === 'ZodArray') {
          properties[key] = { 
            type: 'array',
            description: zodValue._def.description || undefined
          };
        } else if (zodValue._def?.typeName === 'ZodEnum') {
          properties[key] = { 
            type: 'string',
            enum: zodValue._def.values,
            description: zodValue._def.description || undefined
          };
        } else {
          properties[key] = { 
            type: 'string',
            description: zodValue._def?.description || undefined
          };
        }

        if (!zodValue._def?.typeName?.includes('Optional')) {
          required.push(key);
        }
      }

      return {
        type: 'object',
        properties,
        required,
      };
    }

    return { type: 'object' };
  }

  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('🔗 Connected to MCP transport');
  }
}

// Start the server
async function main() {
  const server = new NascoderAzureAIFoundryMCPServer();
  await server.initialize();
  await server.start();
}

// Only run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('💥 Failed to start server:', error);
    process.exit(1);
  });
}

export { NascoderAzureAIFoundryMCPServer };
