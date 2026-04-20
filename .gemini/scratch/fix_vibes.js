const fs = require('fs');
const sql = fs.readFileSync('supabase/seed.sql', 'utf8');

// Map old tags -> new tags that match the form selects
const tagMap = {
  '"Date Night"': '"Dinner"',
  '"Chop Life"': '"Foodie"',
  '"Squad Flex"': '"Party"',
  '"Quick Lunch"': '"Quick"',
  '"Link Up"': '"Chill"',
  '"Lowkey"': '"Chill"',
};

let updated = sql;
for (const [oldTag, newTag] of Object.entries(tagMap)) {
  updated = updated.split(oldTag).join(newTag);
}

fs.writeFileSync('supabase/seed.sql', updated);
console.log('Done — vibe tags reconciled.');
