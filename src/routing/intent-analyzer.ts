import { QueryIntent } from '../types/azure.js';

export class IntentAnalyzer {
  private readonly intentPatterns = {
    vision: {
      keywords: ['image', 'picture', 'photo', 'analyze', 'describe', 'see', 'visual', 'ocr', 'text in image', 'read image'],
      patterns: [
        /analyze.*image/i,
        /describe.*picture/i,
        /what.*in.*image/i,
        /read.*text.*from/i,
        /extract.*text/i,
        /ocr/i,
        /https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|bmp)/i
      ]
    },
    speech: {
      keywords: ['speech', 'audio', 'voice', 'speak', 'listen', 'transcribe', 'tts', 'stt'],
      patterns: [
        /speech.*to.*text/i,
        /text.*to.*speech/i,
        /transcribe/i,
        /convert.*audio/i,
        /read.*aloud/i
      ]
    },
    translation: {
      keywords: ['translate', 'translation', 'language', 'french', 'spanish', 'german', 'chinese', 'japanese', 'italian', 'portuguese', 'russian', 'arabic'],
      patterns: [
        /translate.*to/i,
        /translate.*from/i,
        /translate.*into/i,
        /in.*language/i,
        /convert.*to.*\w+/i,
        /how.*say.*in/i,
        /what.*is.*in.*\w+/i,
        /to\s+(french|spanish|german|italian|portuguese|chinese|japanese|russian|arabic|english)/i
      ]
    },
    document: {
      keywords: ['document', 'pdf', 'form', 'table', 'extract', 'parse', 'analyze document'],
      patterns: [
        /analyze.*document/i,
        /extract.*from.*pdf/i,
        /parse.*form/i,
        /read.*document/i,
        /document.*intelligence/i,
        /https?:\/\/[^\s]+\.(pdf|doc|docx)/i
      ]
    },
    safety: {
      keywords: ['safety', 'harmful', 'inappropriate', 'moderate', 'check content', 'safe'],
      patterns: [
        /check.*safety/i,
        /is.*safe/i,
        /harmful.*content/i,
        /moderate.*content/i,
        /content.*safety/i
      ]
    },
    language: {
      keywords: ['sentiment', 'analyze text', 'entities', 'key phrases', 'language analysis', 'emotion', 'feeling'],
      patterns: [
        /sentiment.*analysis/i,
        /analyze.*text/i,
        /extract.*entities/i,
        /key.*phrases/i,
        /language.*understanding/i,
        /what.*sentiment/i,
        /emotion.*in/i
      ]
    },
    chat: {
      keywords: ['chat', 'ask', 'question', 'help', 'explain', 'tell me', 'what is', 'how to'],
      patterns: [
        /what.*is/i,
        /how.*to/i,
        /explain/i,
        /tell.*me/i,
        /can.*you/i,
        /help.*me/i
      ]
    }
  };

  analyzeIntent(query: string): QueryIntent {
    const normalizedQuery = query.toLowerCase().trim();
    const scores: Record<string, number> = {};

    // Calculate scores for each intent type
    for (const [intentType, config] of Object.entries(this.intentPatterns)) {
      let score = 0;

      // Check keyword matches
      for (const keyword of config.keywords) {
        if (normalizedQuery.includes(keyword.toLowerCase())) {
          score += 1;
        }
      }

      // Check pattern matches (higher weight)
      for (const pattern of config.patterns) {
        if (pattern.test(query)) {
          score += 3; // Increased weight for pattern matches
        }
      }

      scores[intentType] = score;
    }

    // Find the highest scoring intent
    const sortedIntents = Object.entries(scores)
      .sort(([, a], [, b]) => b - a)
      .filter(([, score]) => score > 0);

    if (sortedIntents.length === 0) {
      // Default to chat if no specific intent detected
      return {
        type: 'chat',
        confidence: 0.5,
        reasoning: 'No specific intent detected, defaulting to general chat',
        suggestedService: 'models'
      };
    }

    const [topIntent, topScore] = sortedIntents[0];
    const maxPossibleScore = this.getMaxPossibleScore(topIntent);
    const confidence = Math.min(topScore / maxPossibleScore, 1.0);

    // Boost confidence for strong pattern matches
    const adjustedConfidence = confidence > 0.5 ? Math.min(confidence * 1.2, 1.0) : confidence;

    return {
      type: topIntent as QueryIntent['type'],
      confidence: adjustedConfidence,
      reasoning: this.generateReasoning(topIntent, topScore, normalizedQuery),
      suggestedService: this.mapIntentToService(topIntent)
    };
  }

  private getMaxPossibleScore(intentType: string): number {
    const config = this.intentPatterns[intentType as keyof typeof this.intentPatterns];
    return config.keywords.length + (config.patterns.length * 3);
  }

  private generateReasoning(intent: string, score: number, query: string): string {
    const config = this.intentPatterns[intent as keyof typeof this.intentPatterns];
    const matchedKeywords = config.keywords.filter(keyword => 
      query.includes(keyword.toLowerCase())
    );
    const matchedPatterns = config.patterns.filter(pattern => 
      pattern.test(query)
    );

    let reasoning = `Detected ${intent} intent (score: ${score}).`;
    
    if (matchedKeywords.length > 0) {
      reasoning += ` Keywords: ${matchedKeywords.slice(0, 3).join(', ')}.`;
    }
    
    if (matchedPatterns.length > 0) {
      reasoning += ` Pattern matches: ${matchedPatterns.length}.`;
    }

    return reasoning;
  }

  private mapIntentToService(intent: string): string {
    const serviceMapping: Record<string, string> = {
      vision: 'vision',
      speech: 'speech',
      translation: 'translation',
      document: 'document',
      safety: 'safety',
      language: 'language',
      chat: 'models'
    };

    return serviceMapping[intent] || 'models';
  }

  // Advanced intent analysis with context
  analyzeIntentWithContext(query: string, previousQueries: string[] = []): QueryIntent {
    const baseIntent = this.analyzeIntent(query);

    // Consider context from previous queries
    if (previousQueries.length > 0) {
      const contextIntent = this.analyzeContextualIntent(query, previousQueries);
      if (contextIntent.confidence > baseIntent.confidence) {
        return contextIntent;
      }
    }

    return baseIntent;
  }

  private analyzeContextualIntent(query: string, previousQueries: string[]): QueryIntent {
    // Simple contextual analysis - look for continuation patterns
    const lastQuery = previousQueries[previousQueries.length - 1]?.toLowerCase() || '';
    
    // If previous query was about images and current is vague, assume vision
    if (lastQuery.includes('image') || lastQuery.includes('picture')) {
      if (query.toLowerCase().includes('also') || query.toLowerCase().includes('too')) {
        return {
          type: 'vision',
          confidence: 0.8,
          reasoning: 'Contextual continuation of previous vision query',
          suggestedService: 'vision'
        };
      }
    }

    // If previous query was about translation and current is vague, assume translation
    if (lastQuery.includes('translate') || lastQuery.includes('language')) {
      if (query.toLowerCase().includes('also') || query.toLowerCase().includes('too')) {
        return {
          type: 'translation',
          confidence: 0.8,
          reasoning: 'Contextual continuation of previous translation query',
          suggestedService: 'translation'
        };
      }
    }

    // Default to low confidence chat
    return {
      type: 'chat',
      confidence: 0.3,
      reasoning: 'No strong contextual indicators',
      suggestedService: 'models'
    };
  }
}
