const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  try {
    const { data: products, error: prodE } = await supabase.from('products').select('*');
    console.log('--- products ---');
    console.log(products?.map(p => ({ id: p.id, name: p.name, category: p.category, image_url: p.image_url })));

    const { data: images, error: imgE } = await supabase.from('product_images').select('*');
    console.log('--- product_images ---');
    console.log(images);
  } catch (err) {
    console.error('Unhandled error:', err);
  }
}

test();
