const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  try {
    // 1. Fetch task_dictionary
    const { data: dict, error: dictE } = await supabase.from('task_dictionary').select('*');
    console.log('--- task_dictionary ---');
    console.log(dict);

    // 2. Fetch vouchers
    const { data: vouchers, error: vouchersE } = await supabase.from('vouchers').select('*');
    console.log('--- vouchers ---');
    console.log(vouchers);

    // 3. Fetch user_journey_tasks for 'U01'
    const { data: userTasks, error: userTasksE } = await supabase.from('user_journey_tasks').select('*').eq('user_id', 'U01');
    console.log('--- user_journey_tasks for U01 ---');
    console.log(userTasks);

    // 4. Fetch user_vouchers for 'U01'
    const { data: userVouchers, error: userVouchersE } = await supabase.from('user_vouchers').select('*').eq('user_id', 'U01');
    console.log('--- user_vouchers for U01 ---');
    console.log(userVouchers);
  } catch (err) {
    console.error('Unhandled error:', err);
  }
}

test();
