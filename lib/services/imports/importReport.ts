import { supabase } from '../../supabase';

export interface BatchReport {
  batchId: string;
  datasetName: string;
  version: string;
  status: string;
  totalRows: number;
  stats: {
    pending: number;
    schema_valid: number;
    business_valid: number;
    duplicate: number;
    requires_review: number;
    imported: number;
    rejected: number;
  };
  sampleRejections: any[];
  sampleDuplicates: any[];
}

export class ImportReportingService {
  static async getBatchReport(batchId: string): Promise<BatchReport | null> {
    const { data: batch, error: batchErr } = await supabase
      .from('ingestion_batches')
      .select(`
        id, status, version, total_rows,
        external_datasets ( name )
      `)
      .eq('id', batchId)
      .single();

    if (batchErr || !batch) return null;

    // Aggregate stats from staging_venues
    const { data: stagingData, error: stagingErr } = await supabase
      .from('staging_venues')
      .select('status, raw_payload, validation_errors, duplicate_of')
      .eq('batch_id', batchId);

    if (stagingErr || !stagingData) return null;

    const stats = {
      pending: 0, schema_valid: 0, business_valid: 0,
      duplicate: 0, requires_review: 0, imported: 0, rejected: 0
    };
    const sampleRejections: any[] = [];
    const sampleDuplicates: any[] = [];

    stagingData.forEach(row => {
      // @ts-ignore
      stats[row.status] = (stats[row.status] || 0) + 1;
      
      if (row.status === 'rejected' && sampleRejections.length < 5) {
        sampleRejections.push({ payload: row.raw_payload, errors: row.validation_errors });
      }
      if ((row.status === 'duplicate' || row.status === 'requires_review') && sampleDuplicates.length < 5) {
        sampleDuplicates.push({ payload: row.raw_payload, duplicate_of: row.duplicate_of });
      }
    });

    return {
      batchId: batch.id,
      // @ts-ignore
      datasetName: batch.external_datasets.name,
      version: batch.version || 'v1',
      status: batch.status,
      totalRows: batch.total_rows,
      stats,
      sampleRejections,
      sampleDuplicates
    };
  }

  static async listRecentBatches(): Promise<any[]> {
    const { data, error } = await supabase
      .from('ingestion_batches')
      .select(`
        id, status, version, total_rows, created_at,
        external_datasets ( name )
      `)
      .order('created_at', { ascending: false })
      .limit(10);
      
    if (error) return [];
    return data;
  }
}
