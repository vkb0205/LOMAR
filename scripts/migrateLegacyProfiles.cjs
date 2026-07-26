const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

async function main() {
  dotenv.config({ path: '.env' });

  const serviceKey = process.env.LOMAR_MIGRATION_SERVICE_KEY;
  const url = process.env.VITE_SUPABASE_URL;
  if (!serviceKey || !url) {
    throw new Error('Missing Supabase admin configuration');
  }

  const db = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const snapshotPath = path.join(
    process.env.TEMP,
    'lomar_public_data_before_legacy_cleanup.sql'
  );
  const snapshot = fs.readFileSync(snapshotPath, 'utf8');
  const profileMatch = snapshot.match(
    /COPY "public"\."profiles" \(([^\n]+)\) FROM stdin;\r?\n([\s\S]*?)\r?\n\\\./
  );
  if (!profileMatch) throw new Error('Profile snapshot block not found');

  const columns = [...profileMatch[1].matchAll(/"([^"]+)"/g)].map(
    (match) => match[1]
  );
  const decode = (value) =>
    value === '\\N'
      ? null
      : value
          .replace(/\\t/g, '\t')
          .replace(/\\n/g, '\n')
          .replace(/\\\\/g, '\\');
  const profiles = profileMatch[2]
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) =>
      Object.fromEntries(
        line
          .split('\t')
          .map((value, index) => [columns[index], decode(value)])
      )
    );
  const legacy = profiles.filter((profile) =>
    profile.created_at?.startsWith('2026-07-04')
  );
  if (legacy.length !== 10) {
    throw new Error(`Expected 10 legacy profiles, found ${legacy.length}`);
  }

  const legacyIds = legacy.map((profile) => profile.id);
  const legacyEmails = new Set(
    legacy.map((profile) => profile.email?.toLowerCase())
  );
  const { data: currentProfiles, error: profileReadError } = await db
    .from('profiles')
    .select('*')
    .in('id', legacyIds);
  if (profileReadError) throw profileReadError;
  if (currentProfiles.length !== 10) {
    throw new Error(
      `Remote precondition failed: found ${currentProfiles.length}/10 legacy profiles`
    );
  }

  const { data: authPage, error: authListError } =
    await db.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (authListError) throw authListError;
  const authUsers = authPage.users;
  const duplicateEmails = authUsers.filter(
    (user) => user.email && legacyEmails.has(user.email.toLowerCase())
  );
  if (duplicateEmails.length) {
    throw new Error(
      `Auth already contains ${duplicateEmails.length} legacy email(s)`
    );
  }

  const existingProfileIds = new Set(
    profiles
      .filter((profile) => !legacyIds.includes(profile.id))
      .map((profile) => profile.id)
  );
  const fallbackUser = authUsers.find((user) =>
    existingProfileIds.has(user.id)
  );
  if (!fallbackUser) {
    throw new Error(
      'No existing Auth-backed profile available for temporary post ownership'
    );
  }

  const dependentSpecs = [
    ['vendors', 'owner_id'],
    ['user_favorite_services', 'user_id'],
    ['reviews', 'user_id'],
    ['user_journey_tasks', 'user_id'],
    ['user_vouchers', 'user_id'],
    ['posts', 'user_id'],
    ['post_comments', 'user_id'],
    ['post_likes', 'user_id'],
    ['chat_threads', 'user_id'],
    ['chat_messages', 'user_id'],
    ['ai_design_projects', 'user_id'],
    ['ai_design_generations', 'user_id'],
    ['ai_design_assets', 'user_id'],
    ['service_requests', 'user_id'],
    ['follows', 'follower_id'],
    ['follows', 'followee_user_id'],
  ];
  const dependencies = [];
  for (const [table, column] of dependentSpecs) {
    const { count, error } = await db
      .from(table)
      .select('*', { count: 'exact', head: true })
      .in(column, legacyIds);
    if (error) throw error;
    if (count) dependencies.push({ table, column, count });
  }
  if (
    dependencies.length !== 1 ||
    dependencies[0].table !== 'posts' ||
    dependencies[0].column !== 'user_id' ||
    dependencies[0].count !== 1
  ) {
    throw new Error(
      `Unexpected legacy dependencies: ${JSON.stringify(dependencies)}`
    );
  }

  const { data: legacyPosts, error: postReadError } = await db
    .from('posts')
    .select('id,user_id')
    .in('user_id', legacyIds);
  if (postReadError) throw postReadError;

  const { error: stagePostError } = await db
    .from('posts')
    .update({ user_id: fallbackUser.id })
    .in(
      'id',
      legacyPosts.map((post) => post.id)
    );
  if (stagePostError) throw stagePostError;

  const { data: deletedProfiles, error: deleteError } = await db
    .from('profiles')
    .delete()
    .in('id', legacyIds)
    .select('id');
  if (deleteError) throw deleteError;
  if (deletedProfiles.length !== 10) {
    throw new Error(`Deleted ${deletedProfiles.length}/10 legacy profiles`);
  }

  const created = [];
  for (const legacyProfile of legacy) {
    const password = `Lm!${crypto.randomBytes(18).toString('base64url')}`;
    const metadata = { username: legacyProfile.username };
    if (legacyProfile.full_name) {
      metadata.full_name = legacyProfile.full_name;
    }
    if (legacyProfile.avatar_url) {
      metadata.avatar_url = legacyProfile.avatar_url;
    }

    const { data: createdData, error: createError } =
      await db.auth.admin.createUser({
        email: legacyProfile.email,
        password,
        email_confirm: true,
        user_metadata: metadata,
      });
    if (createError) {
      throw new Error(
        `Failed creating ${legacyProfile.username}: ${createError.message}`
      );
    }

    const authUser = createdData.user;
    const { data: autoProfile, error: autoProfileError } = await db
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle();
    if (autoProfileError) throw autoProfileError;
    if (!autoProfile) {
      throw new Error(
        `Trigger did not create profile for ${legacyProfile.username}`
      );
    }

    const { error: metadataError } = await db
      .from('profiles')
      .update({
        username: legacyProfile.username,
        full_name: legacyProfile.full_name,
        email: legacyProfile.email,
        avatar_url: legacyProfile.avatar_url,
        role: legacyProfile.role,
        onboarding_status: legacyProfile.onboarding_status,
      })
      .eq('id', authUser.id);
    if (metadataError) throw metadataError;

    created.push({
      username: legacyProfile.username,
      email: legacyProfile.email,
      auth_user_id: authUser.id,
      temporary_password: password,
      trigger_profile_created: true,
    });
  }

  const mai = created.find((user) => user.username === 'mai_phuong');
  if (!mai) throw new Error('mai_phuong Auth user was not created');
  const { error: restorePostError } = await db
    .from('posts')
    .update({ user_id: mai.auth_user_id })
    .in(
      'id',
      legacyPosts.map((post) => post.id)
    );
  if (restorePostError) throw restorePostError;

  const newIds = created.map((user) => user.auth_user_id);
  const { data: verifiedProfiles, error: verifyError } = await db
    .from('profiles')
    .select('id,username,email')
    .in('id', newIds);
  if (verifyError) throw verifyError;
  const { count: oldCount, error: oldCountError } = await db
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .in('id', legacyIds);
  if (oldCountError) throw oldCountError;
  if (verifiedProfiles.length !== 10 || oldCount !== 0) {
    throw new Error(
      `Verification failed: new=${verifiedProfiles.length}, old=${oldCount}`
    );
  }

  const credentialPath = path.join(
    process.env.TEMP,
    'lomar_legacy_auth_credentials.json'
  );
  fs.writeFileSync(
    credentialPath,
    JSON.stringify(
      { created_at: new Date().toISOString(), users: created },
      null,
      2
    ),
    { encoding: 'utf8', mode: 0o600 }
  );

  console.log(
    JSON.stringify(
      {
        deleted_legacy_profiles: deletedProfiles.length,
        created_auth_users: created.length,
        trigger_profiles_created: created.filter(
          (user) => user.trigger_profile_created
        ).length,
        restored_posts: legacyPosts.length,
        old_profiles_remaining: oldCount,
        credentials_file: credentialPath,
        users: created.map(({ username, email }) => ({ username, email })),
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
