const xlsx = require('xlsx');
const fs = require('fs');
const papa = require('papaparse');
const path = require('path');

// 1. Read Excel
const excelPath = path.join(__dirname, '..', 'OyaPlan_Database.xlsx');
const wb = xlsx.readFile(excelPath);
const excelVenues = new Map();

for (const sheetName of wb.SheetNames) {
  const ws = wb.Sheets[sheetName];
  const rows = xlsx.utils.sheet_to_json(ws, { header: 1 });
  let headerIdx = -1;
  for (let i = 0; i < Math.min(10, rows.length); i++) {
    if (rows[i] && rows[i].some(c => typeof c === 'string' && c.toLowerCase().includes('venue name'))) {
      headerIdx = i;
      break;
    }
  }
  if (headerIdx !== -1) {
    const headers = rows[headerIdx].map(h => (h || '').trim());
    for (let i = headerIdx + 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || !row.some(c => c)) continue;
      const obj = { sheet: sheetName };
      headers.forEach((h, col) => {
        if (h) obj[h] = row[col];
      });
      if (obj['Venue Name'] && typeof obj['Venue Name'] === 'string') {
        const norm = obj['Venue Name'].trim().toLowerCase().replace(/[^a-z0-9]/g, '');
        if (norm) excelVenues.set(norm, obj);
      }
    }
  }
}

// 2. Read Scratch CSV
const csvPath = path.join(__dirname, '..', 'scratch', 'oyaplan_venues_export.csv');
const csvRaw = fs.readFileSync(csvPath, 'utf8');
const parsed = papa.parse(csvRaw, { header: true }).data.filter(r => r.name && r.name.trim());

// 3. Known area mapping
function formatArea(slug, sheetName) {
  if (!slug && sheetName) {
    const s = sheetName.toLowerCase();
    if (s.includes('victoria')) return 'Victoria Island';
    if (s.includes('lekki')) return 'Lekki Phase 1';
    if (s.includes('surulere')) return 'Surulere';
    if (s.includes('ikoyi')) return 'Ikoyi';
    if (s.includes('yaba')) return 'Yaba';
    if (s.includes('ikeja')) return 'Ikeja';
    if (s.includes('magodo') || s.includes('ogudu')) return 'Ogudu / Magodo';
    return sheetName;
  }
  const s = (slug || '').toLowerCase();
  if (s === 'vi' || s.includes('victoria')) return 'Victoria Island';
  if (s === 'lekki-phase-1' || s.includes('lekki')) return 'Lekki Phase 1';
  if (s === 'ikoyi') return 'Ikoyi';
  if (s === 'ikeja') return 'Ikeja';
  if (s === 'yaba') return 'Yaba';
  if (s === 'surulere') return 'Surulere';
  if (s === 'gbagada') return 'Gbagada';
  if (s === 'maryland') return 'Maryland';
  if (s === 'agege') return 'Agege';
  if (s === 'ogudu') return 'Ogudu';
  if (s === 'ebute-metta') return 'Ebute Metta';
  if (s === 'apapa') return 'Apapa';
  return slug || 'Lagos';
}

function formatZone(areaName, zone) {
  if (zone && zone !== 'undefined') {
    const z = zone.toLowerCase();
    return z.charAt(0).toUpperCase() + z.slice(1);
  }
  const a = (areaName || '').toLowerCase();
  if (a.includes('victoria') || a.includes('lekki') || a.includes('ikoyi')) return 'Island';
  if (a.includes('yaba') || a.includes('surulere') || a.includes('ebute')) return 'Central';
  return 'Mainland';
}

const masterVenues = [];
const seenNames = new Set();

for (const row of parsed) {
  const norm = row.name.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!norm || seenNames.has(norm)) continue;
  seenNames.add(norm);

  const xl = excelVenues.get(norm);
  let areaName = formatArea(row.address_slug || row.area_id, xl ? xl.sheet : null);
  let zone = formatZone(areaName, row.zone);
  
  const budget = parseInt(row.price_per_person, 10) || (xl && parseInt(xl['Budget per Person (₦)'], 10)) || 25000;
  
  let priceTier = row.price_tier || (budget < 10000 ? 1 : budget < 25000 ? 2 : budget < 40000 ? 3 : 4);
  
  let address = (row.address && row.address !== 'undefined' && row.address.length > 3) 
    ? row.address 
    : (xl && xl['Address']) 
    ? xl['Address'] 
    : areaName + ', Lagos';
  address = address.replace(/\r?\n|\r/g, ' ').trim();

  let openingHours = '';
  if (xl && xl['Opening Time']) {
    openingHours = String(xl['Opening Time']).replace(/\r?\n|\r/g, ' ').trim();
  } else if (row.days_open) {
    openingHours = String(row.days_open).replace(/\"/g, '');
  }

  let contactNumber = '';
  if (xl && xl['Contact']) {
    contactNumber = String(xl['Contact']).replace(/\r?\n|\r/g, ' ').trim();
  } else if (row.contact_number) {
    contactNumber = String(row.contact_number).trim();
  }

  let igHandle = '';
  if (row.instagram_handle && row.instagram_handle.trim()) {
    igHandle = row.instagram_handle.trim();
  } else if (xl && xl['Social Media Presence (IG/Tiktok Handles)']) {
    igHandle = String(xl['Social Media Presence (IG/Tiktok Handles)']).replace(/\r?\n|\r/g, ' ').trim();
  }

  let notes = '';
  if (xl && xl['Activity or Things to Note']) {
    notes = String(xl['Activity or Things to Note']).replace(/\r?\n|\r/g, ' ').trim();
  } else if (row.crowd_type || row.best_daypart) {
    notes = [row.crowd_type, row.best_daypart].filter(Boolean).join(' • ');
  }

  let foodType = '';
  if (xl && xl['Menu Type']) {
    foodType = String(xl['Menu Type']).replace(/\r?\n|\r/g, ' ').trim();
  } else if (row.food_type) {
    foodType = String(row.food_type).trim();
  }

  // Specific enrichments for prominent and updated venues
  if (norm === '100hours') {
    foodType = 'Bukka classics, Amala with Gbegiri & Ewedu, Ofada rice, peppered proteins';
    openingHours = 'Open 24 hours, 7 days a week';
    notes = 'Casual, high-vibe local Naija nightlife, outdoor terrace and upstairs seating, live music/Juju bands on weekends';
    row.subcategory = '24-Hour Lounge & Local Kitchen';
  } else if (norm === 'ninezerodegrees') {
    foodType = 'Grilled Jumbo Prawns, Truffle Fries, Signature Cocktails';
    openingHours = 'Tuesday - Sunday: 5:00 PM - 2:00 AM';
    notes = 'Elevated penthouse rooftop view, skyline cocktails & late-night dining';
    row.subcategory = 'Rooftop Terrace Bar & Grill';
  } else if (norm === 'turakalagos') {
    address = '25A Glover Road, Ikoyi, Lagos';
    areaName = 'Ikoyi';
    zone = 'Island';
    foodType = 'International and Nigerian fusion dishes, craft cocktails';
    openingHours = 'Tuesday - Sunday: 12:00 PM - 12:00 AM';
    notes = 'Premium rooftop venue offering skyline views of the city. Rating 4.4(554)';
    row.subcategory = 'Rooftop Lounge & Fusion Dining';
    row.vibe_tags = 'Rooftop,Skyline,Cocktails,Date Night,Upscale,Dinner,Fusion,Ikoyi';
  } else if (norm === 'hqrooftoplounge') {
    foodType = 'Suya platters, finger foods, cocktails & beers';
    openingHours = 'Monday - Sunday: 4:00 PM - 2:00 AM';
    notes = 'Vibrant open-air atmosphere perfect for drinks, catching up with friends, or date nights. Rating 4.2(72)';
    row.subcategory = 'Open-Air Rooftop Lounge';
  } else if (norm === 'theloftikoyi') {
    foodType = 'Artisanal cuisine, pasta, gourmet burgers, craft cocktails';
    openingHours = 'Monday - Sunday: 10:00 AM - 1:00 AM';
    notes = 'Urban rooftop sanctuary overlooking Alfred Rewane Road; artisanal cuisine by day, lounge by night. Rating 4.4(336)';
    row.subcategory = 'Urban Rooftop Sanctuary & Lounge';
  }

  masterVenues.push({
    'Venue Name': row.name.trim(),
    'Area / Neighborhood': areaName,
    'Zone': zone,
    'Address': address,
    'Category': row.category ? (row.category.charAt(0).toUpperCase() + row.category.slice(1)) : 'Restaurant',
    'Subcategory': row.subcategory || (xl ? xl['Menu Type'] : '') || 'Dining / Lounge',
    'Estimated Spend (₦)': budget,
    'Price Tier': priceTier,
    'Vibe Tags': row.vibe_tags ? String(row.vibe_tags).replace(/\"/g, '').replace(/\[object Object\]/g, '') : '',
    'Food Specialty / Menu Type': foodType,
    'Opening Hours': openingHours,
    'Contact Phone': contactNumber,
    'Instagram / Social Handle': igHandle,
    'Key Notes & Activities': notes,
    'Wait Time': xl ? (xl['Wait Time'] || '') : '',
    'Public Menu or Booking': xl ? (xl['Public Menu or Booking'] || '') : '',
    'Verification Status': row.verified_by || 'Verified',
    'Cover Image URL': row.cover_url || ''
  });
}

// Add any remaining excel venues not matched in scratch
for (const [norm, xl] of excelVenues.entries()) {
  if (seenNames.has(norm)) continue;
  seenNames.add(norm);

  const areaName = formatArea(null, xl.sheet);
  const zone = formatZone(areaName, null);
  const budget = parseInt(xl['Budget per Person (₦)'], 10) || 25000;
  const priceTier = budget < 10000 ? 1 : budget < 25000 ? 2 : budget < 40000 ? 3 : 4;

  masterVenues.push({
    'Venue Name': xl['Venue Name'].trim(),
    'Area / Neighborhood': areaName,
    'Zone': zone,
    'Address': (xl['Address'] || (areaName + ', Lagos')).replace(/\r?\n|\r/g, ' ').trim(),
    'Category': 'Restaurant',
    'Subcategory': xl['Menu Type'] || 'Dining / Lounge',
    'Estimated Spend (₦)': budget,
    'Price Tier': priceTier,
    'Vibe Tags': 'Chill, Dinner, Foodie',
    'Food Specialty / Menu Type': xl['Menu Type'] || '',
    'Opening Hours': xl['Opening Time'] || '',
    'Contact Phone': xl['Contact'] || '',
    'Instagram / Social Handle': xl['Social Media Presence (IG/Tiktok Handles)'] || '',
    'Key Notes & Activities': xl['Activity or Things to Note'] || '',
    'Wait Time': xl['Wait Time'] || '',
    'Public Menu or Booking': xl['Public Menu or Booking'] || '',
    'Verification Status': 'Verified',
    'Cover Image URL': ''
  });
}

// Sort alphabetically by Area then Venue Name
masterVenues.sort((a, b) => {
  if (a['Area / Neighborhood'] !== b['Area / Neighborhood']) {
    return a['Area / Neighborhood'].localeCompare(b['Area / Neighborhood']);
  }
  return a['Venue Name'].localeCompare(b['Venue Name']);
});

console.log('Total Master Venues compiled:', masterVenues.length);
const csvOutput = papa.unparse(masterVenues, { quotes: true });
const outputPath = path.join(__dirname, '..', 'oyaplan_venues_master.csv');
fs.writeFileSync(outputPath, csvOutput, 'utf8');
console.log('Successfully wrote oyaplan_venues_master.csv to', outputPath);
