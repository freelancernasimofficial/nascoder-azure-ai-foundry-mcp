import { z } from 'zod';

// MCP Protocol Types
export interface MCPRequest {
  jsonrpc: '2.0';
  id?: string | number;
  method: string;
  params?: any;
}

export interface MCPResponse {
  jsonrpc: '2.0';
  id?: string | number;
  result?: any;
  error?: MCPError;
}

export interface MCPError {
  code: number;
  message: string;
  data?: any;
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: z.ZodSchema;
  outputSchema?: z.ZodSchema;
  handler: (params: any) => Promise<any>;
}

// MCP Error Codes
export const MCPErrorCodes = {
  PARSE_ERROR: -32700,
  INVALID_REQUEST: -32600,
  METHOD_NOT_FOUND: -32601,
  INVALID_PARAMS: -32602,
  INTERNAL_ERROR: -32603,
  TOOL_ERROR: -32000,
} as const;

export class MCPServer {
  private tools = new Map<string, MCPTool>();
  private resources = new Map<string, any>();

  constructor(
    private name: string,
    private version: string,
    private description: string
  ) {}

  registerTool(tool: MCPTool): void {
    this.tools.set(tool.name, tool);
  }

  registerResource(uri: string, resource: any): void {
    this.resources.set(uri, resource);
  }

  async handleRequest(request: MCPRequest): Promise<MCPResponse> {
    try {
      switch (request.method) {
        case 'initialize':
          return this.handleInitialize(request);
        case 'tools/list':
          return this.handleToolsList(request);
        case 'tools/call':
          return this.handleToolCall(request);
        case 'resources/list':
          return this.handleResourcesList(request);
        case 'resources/read':
          return this.handleResourceRead(request);
        default:
          return this.createErrorResponse(
            request.id,
            MCPErrorCodes.METHOD_NOT_FOUND,
            `Method '${request.method}' not found`
          );
      }
    } catch (error) {
      return this.createErrorResponse(
        request.id,
        MCPErrorCodes.INTERNAL_ERROR,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  private handleInitialize(request: MCPRequest): MCPResponse {
    return {
      jsonrpc: '2.0',
      id: request.id,
      result: {
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: {},
          resources: {},
        },
        serverInfo: {
          name: this.name,
          version: this.version,
          description: this.description,
        },
      },
    };
  }

  private handleToolsList(request: MCPRequest): MCPResponse {
    const tools = Array.from(this.tools.values()).map(tool => ({
      name: tool.name,
      description: tool.description,
      inputSchema: this.zodToJsonSchema(tool.inputSchema),
    }));

    return {
      jsonrpc: '2.0',
      id: request.id,
      result: { tools },
    };
  }

  private async handleToolCall(request: MCPRequest): Promise<MCPResponse> {
    const { name, arguments: args } = request.params;
    const tool = this.tools.get(name);

    if (!tool) {
      return this.createErrorResponse(
        request.id,
        MCPErrorCodes.METHOD_NOT_FOUND,
        `Tool '${name}' not found`
      );
    }

    try {
      // Validate input parameters
      const validatedArgs = tool.inputSchema.parse(args);
      
      // Execute tool
      const result = await tool.handler(validatedArgs);
      
      return {
        jsonrpc: '2.0',
        id: request.id,
        result: {
          content: [
            {
              type: 'text',
              text: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
            },
          ],
        },
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return this.createErrorResponse(
          request.id,
          MCPErrorCodes.INVALID_PARAMS,
          `Invalid parameters: ${error.message}`
        );
      }
      
      return this.createErrorResponse(
        request.id,
        MCPErrorCodes.TOOL_ERROR,
        error instanceof Error ? error.message : 'Tool execution failed'
      );
    }
  }

  private handleResourcesList(request: MCPRequest): MCPResponse {
    const resources = Array.from(this.resources.keys()).map(uri => ({
      uri,
      name: uri.split('/').pop() || uri,
      description: `Resource: ${uri}`,
      mimeType: 'application/json',
    }));

    return {
      jsonrpc: '2.0',
      id: request.id,
      result: { resources },
    };
  }

  private handleResourceRead(request: MCPRequest): MCPResponse {
    const { uri } = request.params;
    const resource = this.resources.get(uri);

    if (!resource) {
      return this.createErrorResponse(
        request.id,
        MCPErrorCodes.METHOD_NOT_FOUND,
        `Resource '${uri}' not found`
      );
    }

    return {
      jsonrpc: '2.0',
      id: request.id,
      result: {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(resource, null, 2),
          },
        ],
      },
    };
  }

  private createErrorResponse(id: any, code: number, message: string): MCPResponse {
    return {
      jsonrpc: '2.0',
      id,
      error: { code, message },
    };
  }

  private zodToJsonSchema(schema: z.ZodSchema): any {
    // Simple Zod to JSON Schema conversion
    // In production, use a proper library like zod-to-json-schema
    if (schema instanceof z.ZodObject) {
      const shape = schema.shape;
      const properties: any = {};
      const required: string[] = [];

      for (const [key, value] of Object.entries(shape)) {
        const zodValue = value as any; // Type assertion for Zod schema
        if (zodValue instanceof z.ZodString) {
          properties[key] = { type: 'string' };
        } else if (zodValue instanceof z.ZodNumber) {
          properties[key] = { type: 'number' };
        } else if (zodValue instanceof z.ZodBoolean) {
          properties[key] = { type: 'boolean' };
        } else {
          properties[key] = { type: 'string' }; // fallback
        }

        if (!zodValue.isOptional()) {
          required.push(key);
        }
      }

      return {
        type: 'object',
        properties,
        required,
      };
    }

    return { type: 'object' }; // fallback
  }
}
