import { DatasetImporter } from '../lib/services/imports/datasetImporter';

const DATASET = [
  { venueName: "Choco's Bistro", category: "restaurant", district: "Ikeja", minPrice: 20000, typicalSpend: 20000, confidence: "High", address: "53B, Oduduwa way, Ikeja gra", sourceUrl: "https://x.com/lagosonabudget/status/2073073164704182495" },
  { venueName: "Godaif village", category: "restaurant", district: "Ikoyi", minPrice: 40000, typicalSpend: 40000, confidence: "High", address: "26B, Turnbull road, Ikoyi", sourceUrl: "" },
  { venueName: "Bob diner", category: "restaurant", district: "Ikeja", minPrice: 20000, typicalSpend: 20000, confidence: "High", address: "Opic plaza, mobolaji bank, Anthony way, Ikeja", sourceUrl: "" },
  { venueName: "Saughtex Grills", category: "restaurant", district: "Surulere", minPrice: 7000, typicalSpend: 11000, confidence: "High", address: "Falolu Street off Akerele Road, Surulere", sourceUrl: "" },
  { venueName: "Kulture yard", category: "restaurant", district: "Ikeja", minPrice: 10000, typicalSpend: 10000, confidence: "High", address: "2b, Abba Johnston crescent, Adeniyi jones, Ikeja", sourceUrl: "" },
  { venueName: "Bao Bao House", category: "cafe", district: "Lekki Phase 1", minPrice: 15000, typicalSpend: 15000, confidence: "High", address: "24c Adewunmi Adebimpe Dr, Lekki phase 1", sourceUrl: "" },
  { venueName: "Lala's bistro", category: "restaurant", district: "Victoria Island", minPrice: 30000, typicalSpend: 30000, confidence: "High", address: "251A Sapara Williams, VI", sourceUrl: "" },
  { venueName: "Pop landmark", category: "activity", district: "Victoria Island", minPrice: 50000, typicalSpend: 50000, confidence: "High", address: "3/4 water corporation drive, VI", sourceUrl: "" },
  { venueName: "Cone Cafe", category: "cafe", district: "Lekki Phase 1", minPrice: 15000, typicalSpend: 17500, confidence: "High", address: "45b Adebayo Doherty Rd, Lekki Phase 1", sourceUrl: "" },
  { venueName: "Ikoko Lagos", category: "restaurant", district: "Ikeja", minPrice: 40000, typicalSpend: 40000, confidence: "High", address: "23b, Isaac John, Ikeja Gra", sourceUrl: "" },
  { venueName: "Mamatcha Cafe", category: "cafe", district: "Lekki Phase 1", minPrice: 20000, typicalSpend: 20000, confidence: "High", address: "30 Fola Osibo road, Lekki phase1", sourceUrl: "" },
  { venueName: "Fired and ice", category: "lounge", district: "Lekki Phase 1", minPrice: 20000, typicalSpend: 25000, confidence: "Medium", address: "Plot 28 Block 77, Admiralty way, Lekki phase 1", sourceUrl: "" },
  { venueName: "Hot crust cafe", category: "cafe", district: "Ogudu", minPrice: 10000, typicalSpend: 15000, confidence: "High", address: "Alpha Mall Ogudu Rd, Lagos", sourceUrl: "" },
  { venueName: "Orchid Bistro", category: "restaurant", district: "Ikeja", minPrice: 25000, typicalSpend: 27500, confidence: "High", address: "58a Isaac John St, Ikeja, Lagos", sourceUrl: "" },
  { venueName: "Tiffany Amber Cafe", category: "cafe", district: "Ikoyi", minPrice: 30000, typicalSpend: 37500, confidence: "High", address: "15 Gerrad Road Ikoyi, Lagos", sourceUrl: "" }
];

async function main() {
  console.log('--- OyaPlan Data Platform: Dry Run Import ---');
  
  // 1. Initialize Batch
  const { batchId, error } = await DatasetImporter.startBatch({
    datasetName: "Lagos on a Budget X Extract",
    sourceType: "twitter_extract",
    version: "v1.0",
    checksum: "hash_lagos_budget_001",
    userId: "00000000-0000-0000-0000-000000000000",
    dryRun: true // DRY RUN
  }, DATASET.length);

  if (error || !batchId) {
    console.error('Failed to init batch:', error);
    process.exit(1);
  }

  console.log(`Initialized Batch ID: ${batchId}`);
  
  // 2. Process Rows
  let processed = 0;
  for (const row of DATASET) {
    await DatasetImporter.processRow(batchId, row as any, true);
    processed++;
    process.stdout.write(`\rProcessed ${processed}/${DATASET.length} rows...`);
  }
  
  // 3. Complete Batch
  await DatasetImporter.completeBatch(batchId, true);
  
  console.log(`\n\nDry Run completed successfully. Check the database or COO Dashboard for report stats.`);
  process.exit(0);
}

main().catch(console.error);
