import { supabase } from '../../supabase';
import { RawVenuePayload, ValidationEngine } from './validationEngine';
import { findDuplicateVenue } from '../matching/duplicateMatcher';
import { VenueCoreService } from '../venueCoreService';
import { EvidenceFactory } from '../trustEngine';

export interface ImportOptions {
  datasetName: string;
  sourceType: string;
  version: string;
  checksum: string;
  userId: string;
  dryRun?: boolean;
}

/**
 * Orchestrates the full ETL lifecycle for external datasets.
 * Features:
 * 1. Resumable Batches via `ingestion_batches`
 * 2. Staging Layer isolation
 * 3. Dry Run previews
 * 4. Automatic Rollback support
 */
export class DatasetImporter {

  /**
   * Initializes the import batch in `ingestion_batches`.
   */
  static async startBatch(options: ImportOptions, rowsCount: number): Promise<{ batchId: string; error?: string }> {
    // Upsert the external dataset registry entry
    let datasetId = '';
    const { data: existingDataset } = await supabase.from('external_datasets').select('id').eq('name', options.datasetName).single();
    if (existingDataset) {
      datasetId = existingDataset.id;
    } else {
      const { data: newDataset, error: dsErr } = await supabase.from('external_datasets').insert({
        name: options.datasetName,
        source_type: options.sourceType,
      }).select('id').single();
      if (dsErr || !newDataset) return { batchId: '', error: dsErr?.message || 'Failed to create dataset registry entry' };
      datasetId = newDataset.id;
    }

    const { data: batch, error } = await supabase.from('ingestion_batches').insert({
      dataset_id: datasetId,
      version: options.version,
      checksum: options.checksum,
      status: options.dryRun ? 'preview' : 'processing',
      total_rows: rowsCount,
      imported_by: options.userId
    }).select('id').single();

    if (error || !batch) return { batchId: '', error: error?.message || 'Failed to initialize batch' };
    
    return { batchId: batch.id };
  }

  /**
   * Processes a single raw row through the staging layer.
   * If not dryRun, commits valid rows to production via VenueCoreService.
   */
  static async processRow(batchId: string, rawPayload: RawVenuePayload, dryRun: boolean): Promise<void> {
    
    // 1. Write to staging layer as 'pending'
    const { data: stagingRow, error: stagingErr } = await supabase.from('staging_venues').insert({
      batch_id: batchId,
      raw_payload: rawPayload,
      status: 'pending'
    }).select('id').single();

    if (stagingErr || !stagingRow) return;
    const stagingId = stagingRow.id;

    // 2. Validate
    const validation = await ValidationEngine.validateVenueRow(rawPayload);
    if (!validation.isValid) {
      await this.updateStagingStatus(stagingId, 'rejected', validation.errors);
      return;
    }

    // 3. Duplicate Detection
    const duplicateCheck = await findDuplicateVenue(rawPayload.venueName, validation.districtId!, rawPayload.address || '');
    if (duplicateCheck.status === 'exact_match') {
      await this.updateStagingStatus(stagingId, 'duplicate', [], duplicateCheck.duplicateOf);
      return;
    } else if (duplicateCheck.status === 'requires_review') {
      await this.updateStagingStatus(stagingId, 'requires_review', [], duplicateCheck.duplicateOf);
      return;
    }

    // 4. Update status to validated (meaning it passed schema and duplicates)
    await this.updateStagingStatus(stagingId, 'business_valid');

    // 5. Commit to Production if NOT a Dry Run
    if (!dryRun) {
      const { id: venueId, error: createErr } = await VenueCoreService.createVenue({
        name: rawPayload.venueName,
        district_id: validation.districtId!,
        category: rawPayload.category,
        address: rawPayload.address,
        import_batch_id: batchId
      });

      if (createErr || !venueId) {
        await this.updateStagingStatus(stagingId, 'rejected', [createErr || 'Venue creation failed']);
        return;
      }

      // 6. Generate Trust Intelligence Evidence
      const { error: evidenceErr } = await EvidenceFactory.addEvidence({
        venue_id: venueId,
        source: 'external_dataset',
        evidence_url: rawPayload.sourceUrl,
        price_data: {
          price: rawPayload.typicalSpend,
          type: 'average_spend'
        },
        import_batch_id: batchId
      });

      if (evidenceErr) {
        await this.updateStagingStatus(stagingId, 'rejected', [evidenceErr || 'Evidence creation failed']);
        return;
      }

      await this.updateStagingStatus(stagingId, 'imported');
    }
  }

  static async updateStagingStatus(id: string, status: string, errors: string[] = [], duplicateOf?: string) {
    await supabase.from('staging_venues').update({
      status,
      validation_errors: errors,
      duplicate_of: duplicateOf
    }).eq('id', id);
  }

  /**
   * Finalizes the batch status after all rows are processed.
   */
  static async completeBatch(batchId: string, dryRun: boolean) {
    await supabase.from('ingestion_batches').update({
      status: dryRun ? 'preview' : 'completed',
      updated_at: new Date().toISOString()
    }).eq('id', batchId);
  }

  /**
   * Rolls back an entire batch using the Canonical Data Platform design.
   */
  static async rollbackBatch(batchId: string) {
    // 1. Delete price evidence and venues associated with this batch. 
    // ON DELETE CASCADE on venues ensures other child records are cleared if configured, 
    // but we explicitly delete venues here.
    await supabase.from('venues').delete().eq('import_batch_id', batchId);
    // price_evidence is deleted via ON DELETE CASCADE since it references venue_id, 
    // but for safety we can delete explicitly if it wasn't bound to the venue
    await supabase.from('price_evidence').delete().eq('import_batch_id', batchId);

    // 2. Mark batch as rolled back
    await supabase.from('ingestion_batches').update({
      status: 'rolled_back',
      updated_at: new Date().toISOString()
    }).eq('id', batchId);
  }
}
