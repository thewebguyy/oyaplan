export interface AITelemetry {
  latency_ms: number;
  prompt_tokens: number;
  completion_tokens: number;
  provider_name: string;
}

export interface AIResponse<T> {
  data: T;
  telemetry: AITelemetry;
}

export interface AIProvider {
  /**
   * Generates a structured JSON output (e.g. intent parsing, tool selection)
   */
  generateStructured<T>(prompt: string, schema: any): Promise<AIResponse<T>>;
  
  /**
   * Generates natural language text (e.g. generating human-readable explanations)
   */
  generateText(prompt: string): Promise<AIResponse<string>>;
}

/**
 * Mock Provider for Phase 7 execution (Deterministic bounds testing)
 */
export class MockProvider implements AIProvider {
  async generateStructured<T>(prompt: string, schema: any): Promise<AIResponse<T>> {
    // In production, this would call OpenAI/Anthropic structured outputs
    // Mocking an intent parser for COO tools
    let mockData: any = {};
    if (prompt.includes('health')) {
      mockData = { tool: 'queryHealthForecast', params: { districtId: 'lekki-phase-1' } };
    } else {
      mockData = { tool: 'unknown', params: {} };
    }

    return {
      data: mockData as T,
      telemetry: {
        latency_ms: 150,
        prompt_tokens: 50,
        completion_tokens: 15,
        provider_name: 'mock_provider'
      }
    };
  }

  async generateText(prompt: string): Promise<AIResponse<string>> {
    return {
      data: "This is a deterministic mock response from the AI Orchestrator.",
      telemetry: {
        latency_ms: 200,
        prompt_tokens: 100,
        completion_tokens: 25,
        provider_name: 'mock_provider'
      }
    };
  }
}
