/**
 * Fail a production build when required browser env vars are absent.
 *
 * Vite inlines `import.meta.env.VITE_*` at build time. A missing value is not
 * recoverable at runtime — it is baked into the bundle as `undefined`, and the
 * Supabase client then falls back to a placeholder host that does not resolve.
 * The visible symptom is "Failed to fetch" on login, far from the actual cause
 * (an unset variable in the hosting dashboard).
 *
 * Render declares these with `sync: false`, meaning they are entered in the
 * dashboard rather than read from render.yaml, so an operator deploying a new
 * environment can easily miss them. Failing the build converts that silent,
 * user-visible breakage into an obvious red deploy with an actionable message.
 *
 * Dev is intentionally exempt: `supabaseClient.ts` already throws there, and
 * contributors without credentials should still be able to run `vite`.
 */
const REQUIRED_PROD_ENV_VARS = [
    {
        key: 'VITE_SUPABASE_URL',
        why: 'Browser Supabase client (auth + data). Without it, login posts to a placeholder host and fails with "Failed to fetch".',
    },
    {
        key: 'VITE_SUPABASE_ANON_KEY',
        why: 'Browser Supabase anon/publishable key. Must be the anon key — never the service-role key, which would be readable by every visitor.',
    },
];

/**
 * @param {Record<string, string>} env Result of Vite's `loadEnv`, which merges
 *   `.env*` files with `process.env`. Render supplies dashboard values via the
 *   process environment, so both sources must be considered.
 */
export function assertProductionEnv(env) {
    const missing = REQUIRED_PROD_ENV_VARS.filter(({ key }) => !env[key]?.trim());
    if (missing.length === 0) return;

    const details = missing.map(({ key, why }) => `  - ${key}\n      ${why}`).join('\n');
    throw new Error(
        'Production build aborted: required environment variables are not set.\n\n' +
        `${details}\n\n` +
        'Set them in the hosting provider (Render: Dashboard > Static Site > Environment)\n' +
        'and redeploy. These are compiled into the bundle, so a restart is not enough —\n' +
        'the site must be rebuilt after the values are added.'
    );
}
