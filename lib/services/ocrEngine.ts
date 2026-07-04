import { MenuItem } from '../types';

export interface OCRProvider {
  /**
   * Extracts raw text from a menu image or PDF buffer.
   */
  extractText(fileBuffer: Buffer, mimeType: string): Promise<string>;
  
  /**
   * Identifies prices from raw text.
   */
  extractPrices(rawText: string): Promise<number[]>;
  
  /**
   * Identifies and categorizes items based on raw text.
   */
  extractCategories(rawText: string): Promise<string[]>;
}

export interface ILLMMenuExtractor {
  /**
   * Parses raw OCR text into structured JSON matching OyaPlan's MenuItem schema.
   */
  parseToJSON(rawText: string, venueId: string): Promise<Partial<MenuItem>[]>;
}

export interface DigitizationTask {
  id: string;
  venue_id: string;
  image_url: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

/**
 * Service orchestrator for the menu import pipeline.
 * Currently stubbed to allow swappable OCR providers (e.g. OpenAI, Google Vision, Azure).
 */
export class MenuDigitizationPipeline {
  private ocrProvider: OCRProvider;
  private llmExtractor: ILLMMenuExtractor;

  constructor(ocrProvider: OCRProvider, llmExtractor: ILLMMenuExtractor) {
    this.ocrProvider = ocrProvider;
    this.llmExtractor = llmExtractor;
  }

  /**
   * Ingests an image, extracts text, converts to JSON, and flags for manual review.
   * This would typically run in a background worker processing the menu_digitization_queue.
   */
  async processMenuImage(venueId: string, fileBuffer: Buffer, mimeType: string): Promise<Partial<MenuItem>[]> {
    // 1. Extract raw text via OCR
    const rawText = await this.ocrProvider.extractText(fileBuffer, mimeType);
    
    // 2. Parse into structured OyaPlan items via LLM
    const structuredItems = await this.llmExtractor.parseToJSON(rawText, venueId);
    
    // 3. Validation pipeline goes here (e.g., checking price boundaries, fixing category mismatches)
    // ...
    
    // 4. In a real environment, this pushes to `price_evidence` with verification_status = 'pending'
    return structuredItems;
  }
}
