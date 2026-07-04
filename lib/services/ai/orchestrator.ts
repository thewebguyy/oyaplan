import { AIProvider, MockProvider } from './providers';
import { supabase } from '../../supabase';
import { forecastDistrictConfidence } from '../healthForecastEngine';
import { getDistrictDependencies } from '../knowledgeGraphEngine';
import { scanSystemHealth } from '../alertEngine';

// Dependency Injection for Provider
const provider: AIProvider = new MockProvider();

/**
 * orchestrator — Phase 7 Platform
 * Multi-tenant AI Orchestration Layer.
 * Currently supporting internal COO Operations via RAG tool-calling.
 */

export async function logTelemetry(telemetry: any) {
  try {
    await supabase.from('system_telemetry_logs').insert({
      metric_name: 'llm_orchestration',
      execution_ms: telemetry.latency_ms,
      metadata: {
        provider: telemetry.provider_name,
        prompt_tokens: telemetry.prompt_tokens,
        completion_tokens: telemetry.completion_tokens
      }
    });
  } catch (err) {
    console.error("Telemetry failure", err);
  }
}

export async function executeOperationsQuery(naturalLanguageQuery: string) {
  // 1. Intent Detection (Tool Selection)
  const intentResponse = await provider.generateStructured<{ tool: string; params: any }>(
    `Parse the operational intent for COO RAG tools. Query: "${naturalLanguageQuery}"`,
    {}
  );
  
  await logTelemetry(intentResponse.telemetry);

  const { tool, params } = intentResponse.data;
  let deterministicResult: any = null;

  // 2. Deterministic Execution (Safety Boundary)
  if (tool === 'queryHealthForecast') {
    // LLM identified a district forecast query
    const districtId = params.districtId || 'lekki-phase-1'; // fallback
    deterministicResult = await forecastDistrictConfidence(districtId, 7);
  } else if (tool === 'queryDependencies') {
    const districtId = params.districtId || 'lekki-phase-1';
    deterministicResult = await getDistrictDependencies(districtId);
  } else if (tool === 'scanAlerts') {
    deterministicResult = await scanSystemHealth();
  } else {
    return {
      answer: "I am unable to map that query to a deterministic operational tool.",
      data: null
    };
  }

  // 3. Response Generation
  const prompt = `
    The COO asked: "${naturalLanguageQuery}"
    The deterministic engine returned: ${JSON.stringify(deterministicResult)}
    Provide a clear, brief operational summary.
  `;
  
  const textResponse = await provider.generateText(prompt);
  await logTelemetry(textResponse.telemetry);

  return {
    answer: textResponse.data,
    data: deterministicResult
  };
}
