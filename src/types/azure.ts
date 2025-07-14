export interface AzureAIService {
  name: string;
  endpoint: string;
  apiKey?: string;
  region: string;
  capabilities: string[];
  status: 'available' | 'unavailable' | 'unknown';
}

export interface ModelDeployment {
  name: string;
  modelName: string;
  version: string;
  endpoint: string;
  capabilities: ModelCapability[];
  status: 'ready' | 'creating' | 'failed';
}

export interface ModelCapability {
  type: 'text-generation' | 'vision' | 'function-calling' | 'embeddings' | 'chat';
  description: string;
}

export interface QueryIntent {
  type: 'chat' | 'vision' | 'speech' | 'translation' | 'document' | 'safety' | 'language';
  confidence: number;
  reasoning: string;
  suggestedService: string;
}

export interface MCPToolRequest {
  name: string;
  arguments: Record<string, any>;
}

export interface MCPToolResponse {
  content: Array<{
    type: 'text' | 'image' | 'resource';
    text?: string;
    data?: string;
    mimeType?: string;
  }>;
  isError?: boolean;
}

export interface ServiceHealthCheck {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  lastChecked: Date;
  error?: string;
}

// Azure AI Services specific types
export interface SpeechConfig {
  subscriptionKey: string;
  region: string;
  language?: string;
}

export interface VisionAnalysisResult {
  description?: string;
  tags?: string[];
  objects?: Array<{
    name: string;
    confidence: number;
    boundingBox: number[];
  }>;
  text?: string;
  categories?: Array<{
    name: string;
    score: number;
  }>;
  faces?: Array<{
    age: number;
    gender: string;
    faceRectangle: any;
  }>;
  color?: any;
  imageType?: any;
}

export interface TranslationResult {
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  confidence: number;
}

export interface DocumentAnalysisResult {
  content: string;
  pages: number;
  tables?: Array<{
    rowCount: number;
    columnCount: number;
    cells: Array<{
      text: string;
      rowIndex: number;
      columnIndex: number;
    }>;
  }>;
  keyValuePairs?: Array<{
    key: string;
    value: string;
    confidence: number;
  }>;
  paragraphs?: Array<{
    content: string;
    boundingRegions: any[];
  }>;
}

export interface ContentSafetyResult {
  categoriesAnalysis: Array<{
    category: 'Hate' | 'SelfHarm' | 'Sexual' | 'Violence';
    severity: 0 | 2 | 4 | 6;
  }>;
  blocklistsMatch?: Array<{
    blocklistName: string;
    blocklistItemId: string;
    blocklistItemText: string;
  }>;
}
