// One-off: create a demo admin account using the anon key.
// Signs up, signs in, ensures a profiles row exists, sets role = 'admin'.
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(url, key, { auth: { persistSession: false } });

const EMAIL = process.env.SEED_EMAIL || 'lomar.admin@gmail.com';
const PASSWORD = process.env.SEED_PASSWORD || 'Admin@12345';
const FULL_NAME = 'LOMAR Admin';

async function main() {
  // 1. Sign up (ignore "already registered" so the script is re-runnable).
  const { error: signUpErr } = await supabase.auth.signUp({
    email: EMAIL,
    password: PASSWORD,
    options: { data: { full_name: FULL_NAME, wedding_role: 'planner' } },
  });
  if (signUpErr && !/already registered/i.test(signUpErr.message)) {
    console.warn('signUp:', signUpErr.message);
  }

  // 2. Sign in to obtain an active session (fails if email confirmation is ON).
  const { data: signInData, error: signInErr } =
    await supabase.auth.signInWithPassword({ email: EMAIL, password: PASSWORD });
  if (signInErr) {
    console.error('signIn failed:', signInErr.message);
    console.error('If this says "Email not confirmed", disable email confirmation');
    console.error('in Supabase (Auth > Providers > Email) or confirm the address, then re-run.');
    process.exit(1);
  }
  const uid = signInData.user.id;
  console.log('Signed in. uid =', uid);

  // 3. Ensure a profiles row exists, then promote to admin.
  const { data: existing } = await supabase
    .from('profiles').select('id').eq('id', uid).maybeSingle();
  if (!existing) {
    const { error: insErr } = await supabase.from('profiles').insert({
      id: uid, email: EMAIL, full_name: FULL_NAME, role: 'admin',
    });
    if (insErr) { console.error('insert profile:', insErr.message); process.exit(1); }
    console.log('Created profiles row with role = admin.');
  } else {
    const { error: updErr } = await supabase
      .from('profiles').update({ role: 'admin', updated_at: new Date().toISOString() })
      .eq('id', uid);
    if (updErr) { console.error('update role:', updErr.message); process.exit(1); }
    console.log('Updated existing profiles row -> role = admin.');
  }

  // 4. Verify.
  const { data: check } = await supabase
    .from('profiles').select('id, email, role').eq('id', uid).single();
  console.log('Result:', check);
  console.log('\nDemo admin ready:');
  console.log('  email:    ' + EMAIL);
  console.log('  password: ' + PASSWORD);
}

main().catch((e) => { console.error(e); process.exit(1); });
