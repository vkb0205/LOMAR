const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  try {
    const { data: options, error: optE } = await supabase.from('customization_options').select('*, customization_values(*)');
    console.log('--- customization_options & values ---');
    console.dir(options, { depth: null });
  } catch (err) {
    console.error('Unhandled error:', err);
  }
}

test();
