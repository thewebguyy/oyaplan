import { supabase } from '../../supabase';

/**
 * memoryEngine — Phase 7 Platform
 * Manages conversational state for RAG sessions (COO operations, Consumer chat).
 */

export async function getConversationMemory(sessionId: string) {
  const { data } = await supabase
    .from('conversation_memory')
    .select('last_intent, suggested_plans')
    .eq('session_id', sessionId)
    .single();
  return data;
}

export async function saveConversationMemory(sessionId: string, userId: string, intent: any, plans: any[]) {
  const payload = {
    session_id: sessionId,
    user_id: userId,
    last_intent: intent,
    suggested_plans: plans,
    updated_at: new Date().toISOString()
  };

  const { error } = await supabase
    .from('conversation_memory')
    .upsert(payload);
    
  if (error) console.error("Failed to save conversation memory:", error.message);
}
