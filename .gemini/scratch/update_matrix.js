const fs = require('fs');
const sqlFile = 'supabase/seed.sql';
let sql = fs.readFileSync(sqlFile, 'utf8');

const allAreas = [
  "ikeja", "gbagada", "yaba", "surulere", "ogudu", "agege", 
  "lekki-phase-1", "vi", "ikoyi", "maryland", "ebute-metta", "apapa"
];

const zones = {
  mainland: ["ikeja", "gbagada", "ogudu", "agege", "maryland"],
  central: ["yaba", "surulere", "ebute-metta"],
  island: ["lekki-phase-1", "vi", "ikoyi"],
  other: ["apapa"]
};

function getZone(area) {
  for (const [z, areas] of Object.entries(zones)) {
    if (areas.includes(area)) return z;
  }
  return "mainland";
}

function calculateBaseMatrix(spotSlug) {
  if (!spotSlug) return {};
  
  const spotZone = getZone(spotSlug);
  const matrix = {};
  
  for (const startArea of allAreas) {
    if (startArea === spotSlug) {
      matrix[startArea] = 1000;
      continue;
    }
    const startZone = getZone(startArea);
    if (startZone === spotZone) {
      matrix[startArea] = 2500;
    } else if ((startZone === 'mainland' && spotZone === 'central') || (startZone === 'central' && spotZone === 'mainland')) {
      matrix[startArea] = 3500;
    } else if ((startZone === 'island' && spotZone === 'central') || (startZone === 'central' && spotZone === 'island')) {
      matrix[startArea] = 4000;
    } else if ((startZone === 'island' && spotZone === 'mainland') || (startZone === 'mainland' && spotZone === 'island')) {
      matrix[startArea] = 7500;
    } else {
      matrix[startArea] = 5000;
    }
  }
  return matrix;
}

const areaMap = {
  '11111111-1111-1111-1111-111111111111': 'ikeja',
  '22222222-2222-2222-2222-222222222222': 'gbagada',
  '33333333-3333-3333-3333-333333333333': 'yaba',
  '44444444-4444-4444-4444-444444444444': 'surulere',
  '55555555-5555-5555-5555-555555555555': 'ogudu',
  '66666666-6666-6666-6666-666666666666': 'agege',
  '77777777-7777-7777-7777-777777777777': 'lekki-phase-1',
  '88888888-8888-8888-8888-888888888888': 'vi',
  '99999999-9999-9999-9999-999999999999': 'ikoyi',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa': 'maryland',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb': 'ebute-metta',
  'cccccccc-cccc-cccc-cccc-cccccccccccc': 'apapa'
};

let updatedSql = sql.split('\n').map(line => {
  if (line.includes("INSERT INTO spots") || !line.trim().startsWith("(")) {
    return line;
  }
  
  const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;
  const match = line.match(uuidRegex);
  if (!match) return line;
  
  const areaId = match[0];
  const spotSlug = areaMap[areaId];
  const matrix = calculateBaseMatrix(spotSlug);
  const matrixJson = JSON.stringify(matrix);
  
  const replaceRegex = /'\{[^{}]*\}'(?=\s*,\s*(true|false)\s*\)(,)?\s*$)/;
  
  return line.replace(replaceRegex, `'${matrixJson}'`);
}).join('\n');

fs.writeFileSync(sqlFile, updatedSql);
console.log("Updated seed.sql");
