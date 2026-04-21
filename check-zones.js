const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://gitehsavgvrxsvktepid.supabase.co';
const supabaseKey = 'sb_publishable_vntqvYz8Q7tQizGzVs2ERw_FGrau2M9';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  let { data, error } = await supabase.from('zones').select('*');
  console.log("Zones:", data);
  console.log("Error:", error);
}
run();
