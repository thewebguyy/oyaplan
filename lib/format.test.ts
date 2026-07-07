import { describe, it, expect } from 'vitest';
import { formatNaira } from './format';

describe('formatNaira', () => {
  it('should add thousands separators', () => {
    expect(formatNaira(123456)).toBe('123,456');
  });

  it('should not add a separator for numbers under 1000', () => {
    expect(formatNaira(500)).toBe('500');
  });

  it('should round non-integer amounts', () => {
    expect(formatNaira(15000.6)).toBe('15,001');
  });

  it('should handle zero', () => {
    expect(formatNaira(0)).toBe('0');
  });

  it('should handle large amounts with multiple separators', () => {
    expect(formatNaira(12345678)).toBe('12,345,678');
  });
});
