import { describe, it, expect, vi, beforeEach } from 'vitest';
import { previewBulkMediaUpload, executeBulkMediaUpload } from './actions';

// Mock dependencies
vi.mock('@/lib/admin/permissions', () => ({
  isAuthorizedAdmin: vi.fn()
}));

vi.mock('@supabase/supabase-js', () => {
  return {
    createClient: vi.fn()
  };
});

vi.mock('@/lib/admin/repositories/activityRepository', () => ({
  ActivityRepository: {
    logActivity: vi.fn()
  }
}));

import { isAuthorizedAdmin } from '@/lib/admin/permissions';
import { createClient } from '@supabase/supabase-js';
import { ActivityRepository } from '@/lib/admin/repositories/activityRepository';

describe('Bulk Venue Media Upload', () => {
  let mockSupabase: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup Admin Auth
    (isAuthorizedAdmin as any).mockResolvedValue({
      authorized: true, email: 'admin@oyaplan.com', role: 'admin'
    });

    // Setup Supabase Mock
    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
    };
    (createClient as any).mockReturnValue(mockSupabase);
  });

  describe('previewBulkMediaUpload', () => {
    it('should correctly normalize and match venues, removing duplicates', async () => {
      mockSupabase.select.mockResolvedValue({
        data: [
          { id: '1', name: 'Venue A' },
          { id: '2', name: 'Venue B ' },
          { id: '3', name: 'Venue C' },
          { id: '4', name: 'Venue C' } // Ambiguous
        ],
        error: null
      });

      const records = [
        { venueName: ' venue a ', imageUrls: ['http://img1.jpg', 'http://img2.jpg', 'http://img1.jpg', ' invalid ', ''] },
        { venueName: 'Venue B', imageUrls: ['http://img3.jpg'] },
        { venueName: 'Venue C', imageUrls: ['http://img4.jpg'] },
        { venueName: 'Not Found', imageUrls: ['http://img5.jpg'] }
      ];

      const result = await previewBulkMediaUpload(records);

      expect(result.matched).toBe(2);
      expect(result.ambiguous).toBe(1);
      expect(result.unmatched).toBe(1);
      expect(result.duplicateUrlsCount).toBe(3); // 1 duplicate img1 + 1 invalid + 1 empty space

      const venueA = result.previewRows.find(r => r.originalName === ' venue a ');
      expect(venueA?.status).toBe('Ready');
      expect(venueA?.venueId).toBe('1');
      expect(venueA?.imageUrls).toEqual(['http://img1.jpg', 'http://img2.jpg']);
      
      const venueC = result.previewRows.find(r => r.originalName === 'Venue C');
      expect(venueC?.status).toBe('Ambiguous');
      expect(venueC?.venueId).toBeUndefined();

      const notFound = result.previewRows.find(r => r.originalName === 'Not Found');
      expect(notFound?.status).toBe('Not Found');
    });

    it('should reject non-admin users', async () => {
      (isAuthorizedAdmin as any).mockResolvedValue({ authorized: false });
      await expect(previewBulkMediaUpload([])).rejects.toThrow('Unauthorized');
    });
  });

  describe('executeBulkMediaUpload', () => {
    it('should replace cover_url and gallery_urls correctly, skipping zero-image venues', async () => {
      mockSupabase.eq.mockResolvedValue({ error: null });

      const previewRows: any[] = [
        { status: 'Ready', venueId: '1', originalName: 'A', imageUrls: ['http://cover.jpg', 'http://g1.jpg', 'http://g2.jpg'] },
        { status: 'Ready', venueId: '2', originalName: 'B', imageUrls: [] }, // Zero images
        { status: 'Not Found', venueId: '3', originalName: 'C', imageUrls: ['http://c.jpg'] }, // Unmatched
      ];

      const result = await executeBulkMediaUpload(previewRows);

      expect(result.matched).toBe(2); // Only 'Ready' ones
      expect(result.skipped).toBe(2); // 1 Not found + 1 Zero images
      expect(result.updated).toBe(1);
      expect(result.failed).toBe(0);

      // Verify update payload for Venue 1
      expect(mockSupabase.from).toHaveBeenCalledWith('venues');
      expect(mockSupabase.update).toHaveBeenCalledWith({
        cover_url: 'http://cover.jpg',
        gallery_urls: ['http://g1.jpg', 'http://g2.jpg']
      });
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', '1');

      // Verify Audit
      expect(ActivityRepository.logActivity).toHaveBeenCalledWith(
        'admin@oyaplan.com',
        'Bulk Media Replace',
        'Venue',
        '1',
        { cover_url: 'http://cover.jpg', gallery_urls: ['http://g1.jpg', 'http://g2.jpg'], total_images: 3, source: 'Bulk Upload' }
      );
    });

    it('should handle partial failures', async () => {
      mockSupabase.eq
        .mockResolvedValueOnce({ error: { message: 'DB Error' } })
        .mockResolvedValueOnce({ error: null });

      const previewRows: any[] = [
        { status: 'Ready', venueId: '1', originalName: 'A', imageUrls: ['http://cover.jpg'] },
        { status: 'Ready', venueId: '2', originalName: 'B', imageUrls: ['http://cover2.jpg'] },
      ];

      const result = await executeBulkMediaUpload(previewRows);

      expect(result.updated).toBe(1);
      expect(result.failed).toBe(1);
      expect(result.errors.length).toBe(1);
      expect(result.errors[0].venueName).toBe('A');
      expect(result.errors[0].reason).toBe('DB Error');
    });
  });
});
