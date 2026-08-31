import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  enqueueFeedback,
  getEligibleFeedback,
  snoozeFeedback,
  dismissFeedback,
  PendingFeedbackItem
} from './feedbackQueue';

const QUEUE_KEY = 'oyaplan_pending_feedback';

describe('feedbackQueue State Machine', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    window.localStorage.clear();
    // Mock Date.now() to a fixed timestamp
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-31T10:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const getRawQueue = (): PendingFeedbackItem[] => {
    const raw = window.localStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  };

  it('should enqueue a plan and make it ineligible immediately', () => {
    enqueueFeedback({
      planId: 'plan-1',
      spotId: 'spot-1',
      spotName: 'Cafe Neo',
      estimatedTotal: 5000
    });

    const queue = getRawQueue();
    expect(queue.length).toBe(1);
    expect(queue[0].planId).toBe('plan-1');
    expect(queue[0].addedAt).toBe(Date.now());
    expect(queue[0].nextPromptAt).toBe(Date.now() + 24 * 60 * 60 * 1000);

    const eligible = getEligibleFeedback();
    expect(eligible).toBeNull();
  });

  it('should deduplicate when enqueueing the same planId', () => {
    enqueueFeedback({ planId: 'plan-1', spotId: 's1', spotName: 'S1', estimatedTotal: 10 });
    
    // Move time forward a bit
    vi.advanceTimersByTime(1000);
    
    // Re-enqueue the same planId
    enqueueFeedback({ planId: 'plan-1', spotId: 's1', spotName: 'S1 Updated', estimatedTotal: 20 });

    const queue = getRawQueue();
    expect(queue.length).toBe(1);
    expect(queue[0].spotName).toBe('S1 Updated');
    expect(queue[0].addedAt).toBe(Date.now()); // Should use the new timestamp
  });

  it('should return the oldest eligible plan', () => {
    enqueueFeedback({ planId: 'plan-1', spotId: 's1', spotName: 'S1', estimatedTotal: 10 });
    
    vi.advanceTimersByTime(2 * 60 * 60 * 1000); // 2 hours later
    enqueueFeedback({ planId: 'plan-2', spotId: 's2', spotName: 'S2', estimatedTotal: 20 });

    // Advance by 25 hours. Both are eligible, but plan-1 is older.
    vi.advanceTimersByTime(25 * 60 * 60 * 1000);

    const eligible = getEligibleFeedback();
    expect(eligible).not.toBeNull();
    expect(eligible?.planId).toBe('plan-1');
  });

  it('should handle snooze correctly', () => {
    enqueueFeedback({ planId: 'plan-1', spotId: 's1', spotName: 'S1', estimatedTotal: 10 });
    
    vi.advanceTimersByTime(25 * 60 * 60 * 1000); // Now eligible
    expect(getEligibleFeedback()?.planId).toBe('plan-1');

    snoozeFeedback('plan-1');
    
    // Now it should NOT be eligible
    expect(getEligibleFeedback()).toBeNull();

    const queue = getRawQueue();
    expect(queue[0].status).toBe('snoozed');
    expect(queue[0].nextPromptAt).toBe(Date.now() + 48 * 60 * 60 * 1000);
  });

  it('should permanently remove when dismissed', () => {
    enqueueFeedback({ planId: 'plan-1', spotId: 's1', spotName: 'S1', estimatedTotal: 10 });
    dismissFeedback('plan-1');
    expect(getRawQueue().length).toBe(0);
  });

  it('should recover gracefully from corrupted localStorage', () => {
    window.localStorage.setItem(QUEUE_KEY, 'invalid json {[');
    expect(getEligibleFeedback()).toBeNull();
    expect(window.localStorage.getItem(QUEUE_KEY)).toBeNull(); // Self-healed (cleared)
  });
});
