export interface PendingFeedbackItem {
  planId: string;
  spotId: string;
  spotName: string;
  estimatedTotal: number;
  addedAt: number;
  nextPromptAt: number;
  status: 'pending' | 'snoozed';
}

const QUEUE_KEY = 'oyaplan_pending_feedback';
const INITIAL_WAIT_MS = 24 * 60 * 60 * 1000; // 24 hours
const SNOOZE_WAIT_MS = 48 * 60 * 60 * 1000; // 48 hours

/**
 * Safely reads the queue from localStorage. 
 * Corrupted data is purged.
 */
function readQueue(): PendingFeedbackItem[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const raw = window.localStorage.getItem(QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    
    if (!Array.isArray(parsed)) throw new Error('Not an array');
    
    // Filter out invalid shapes
    return parsed.filter(item => 
      item && typeof item.planId === 'string' && typeof item.spotId === 'string'
    ) as PendingFeedbackItem[];
  } catch (e) {
    // If corruption is detected, clear it to self-heal
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(QUEUE_KEY);
    }
    return [];
  }
}

/**
 * Writes the queue to localStorage.
 */
function writeQueue(queue: PendingFeedbackItem[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    window.localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch (e) {
    console.error('Failed to write feedback queue:', e);
  }
}

/**
 * Adds a new plan to the feedback queue.
 * Prioritizes newest over duplicate planIds.
 */
export function enqueueFeedback(item: { planId: string; spotId: string; spotName: string; estimatedTotal: number }): void {
  const queue = readQueue();
  
  // Remove existing entry for this plan if it exists (deduplication)
  const filtered = queue.filter(q => q.planId !== item.planId);
  
  const now = Date.now();
  filtered.push({
    ...item,
    addedAt: now,
    nextPromptAt: now + INITIAL_WAIT_MS,
    status: 'pending'
  });
  
  writeQueue(filtered);
}

/**
 * Retrieves the oldest eligible plan to prompt for.
 * Eligibility: Date.now() >= nextPromptAt
 */
export function getEligibleFeedback(): PendingFeedbackItem | null {
  const queue = readQueue();
  const now = Date.now();
  
  // Find all eligible
  const eligible = queue.filter(q => now >= q.nextPromptAt);
  
  if (eligible.length === 0) return null;
  
  // Return the oldest one (smallest addedAt)
  eligible.sort((a, b) => a.addedAt - b.addedAt);
  
  return eligible[0];
}

/**
 * Snoozes a prompt for 48 hours ("Not Yet").
 */
export function snoozeFeedback(planId: string): void {
  const queue = readQueue();
  const updated = queue.map(q => {
    if (q.planId === planId) {
      return {
        ...q,
        status: 'snoozed' as const,
        nextPromptAt: Date.now() + SNOOZE_WAIT_MS
      };
    }
    return q;
  });
  writeQueue(updated);
}

/**
 * Permanently removes a prompt ("Didn't go" or "Submitted successfully").
 */
export function dismissFeedback(planId: string): void {
  const queue = readQueue();
  const filtered = queue.filter(q => q.planId !== planId);
  writeQueue(filtered);
}
