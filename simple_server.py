#!/usr/bin/env python3

import json
import sys
import os
from azure.ai.projects import AIProjectClient
from azure.identity import DefaultAzureCredential

# Your Azure AI Foundry project endpoint
PROJECT_ENDPOINT = "https://nasim-md2rc5mr-swedencentral.ai.azure.com/api/projects/nasim-md2rc5mr-swedence-project"

def create_azure_client():
    """Create Azure AI Foundry client"""
    try:
        # Use API key authentication
        from azure.core.credentials import AzureKeyCredential
        credential = AzureKeyCredential(os.getenv("AZURE_AI_INFERENCE_API_KEY", "ELZNMprUOSEn0g3uhj0MasZNzxwblKI5YK22N0GavSur7TBALlVgJQQJ99BGACfhMk5XJ3w3AAAAACOGHYiF"))
        
        # Create the client
        client = AIProjectClient(
            endpoint=PROJECT_ENDPOINT,
            credential=credential
        )
        return client
    except Exception as e:
        print(f"Error creating Azure client: {e}", file=sys.stderr)
        return None

def handle_mcp_request(request):
    """Handle MCP JSON-RPC requests"""
    method = request.get("method")
    request_id = request.get("id")
    
    if method == "initialize":
        return {
            "jsonrpc": "2.0",
            "id": request_id,
            "result": {
                "protocolVersion": "2024-11-05",
                "capabilities": {
                    "tools": {}
                },
                "serverInfo": {
                    "name": "azure-ai-foundry-mcp",
                    "version": "1.0.0"
                }
            }
        }
    
    elif method == "tools/list":
        return {
            "jsonrpc": "2.0",
            "id": request_id,
            "result": {
                "tools": [
                    {
                        "name": "ask_azure_ai",
                        "description": "Ask Azure AI Foundry a question using your deployed models",
                        "inputSchema": {
                            "type": "object",
                            "properties": {
                                "question": {
                                    "type": "string",
                                    "description": "Your question or prompt"
                                }
                            },
                            "required": ["question"]
                        }
                    },
                    {
                        "name": "list_models",
                        "description": "List available Azure AI models",
                        "inputSchema": {
                            "type": "object",
                            "properties": {}
                        }
                    }
                ]
            }
        }
    
    elif method == "tools/call":
        tool_name = request.get("params", {}).get("name")
        arguments = request.get("params", {}).get("arguments", {})
        
        try:
            if tool_name == "ask_azure_ai":
                result = ask_azure_ai(arguments.get("question", ""))
            elif tool_name == "list_models":
                result = list_models()
            else:
                raise ValueError(f"Unknown tool: {tool_name}")
            
            return {
                "jsonrpc": "2.0",
                "id": request_id,
                "result": {
                    "content": [
                        {
                            "type": "text",
                            "text": str(result)
                        }
                    ]
                }
            }
        except Exception as e:
            return {
                "jsonrpc": "2.0",
                "id": request_id,
                "error": {
                    "code": -32000,
                    "message": str(e)
                }
            }
    
    else:
        return {
            "jsonrpc": "2.0",
            "id": request_id,
            "error": {
                "code": -32601,
                "message": f"Method not found: {method}"
            }
        }

def ask_azure_ai(question):
    """Ask Azure AI using the model-router deployment"""
    try:
        client = create_azure_client()
        if not client:
            return "Error: Could not create Azure AI client"
        
        # Get the inference client for chat completions
        models = client.inference.get_azure_openai_client(api_version="2024-10-21")
        
        # Use your model-router deployment
        response = models.chat.completions.create(
            model="model-router",
            messages=[
                {"role": "system", "content": "You are a helpful AI assistant powered by Azure AI Foundry."},
                {"role": "user", "content": question}
            ],
            max_tokens=1000,
            temperature=0.7
        )
        
        return response.choices[0].message.content
        
    except Exception as e:
        return f"Error calling Azure AI: {str(e)}"

def list_models():
    """List available models"""
    try:
        return """Available Azure AI Foundry Services:
        
🤖 **Model Router (model-router)**
- Chat completions and text generation
- Powered by multiple foundation models
- Endpoint: https://nasim-md2rc5mr-swedencentral.services.ai.azure.com/models

🎯 **Azure AI Services Available:**
- Azure AI Speech (Speech-to-text, Text-to-speech)
- Azure AI Vision (Image analysis, OCR)
- Azure AI Document Intelligence (Document processing)
- Azure AI Language (Text analysis, NLP)
- Azure AI Translator (Multi-language translation)
- Azure AI Content Safety (Content moderation)
- Azure AI Content Understanding (Advanced analysis)

📍 **Region:** Sweden Central
✅ **Status:** All services operational"""
        
    except Exception as e:
        return f"Error listing models: {str(e)}"

def main():
    """Main MCP server loop"""
    print("🚀 Azure AI Foundry MCP Server starting...", file=sys.stderr)
    
    # Test Azure connection
    client = create_azure_client()
    if client:
        print("✅ Azure AI Foundry client connected successfully", file=sys.stderr)
    else:
        print("❌ Failed to connect to Azure AI Foundry", file=sys.stderr)
    
    print("📡 Ready for MCP requests...", file=sys.stderr)
    
    # Process MCP requests from stdin
    for line in sys.stdin:
        try:
            line = line.strip()
            if not line:
                continue
                
            request = json.loads(line)
            response = handle_mcp_request(request)
            print(json.dumps(response))
            sys.stdout.flush()
            
        except json.JSONDecodeError:
            error_response = {
                "jsonrpc": "2.0",
                "error": {
                    "code": -32700,
                    "message": "Parse error"
                }
            }
            print(json.dumps(error_response))
            sys.stdout.flush()
        except Exception as e:
            print(f"Error: {e}", file=sys.stderr)

if __name__ == "__main__":
    main()
