import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
// @ts-expect-error -- plain .mjs helper, no type declarations needed for a build script.
import { assertProductionEnv } from './scripts/assertProductionEnv.mjs';

export default defineConfig(({ mode, command }) => {
  // Third arg '' disables the VITE_ prefix filter so process.env values
  // supplied by the host (Render dashboard) are merged with any .env files.
  const env = loadEnv(mode, '.', '');

  // Guard the real build only. `vite dev`/`preview` stay usable without
  // credentials, and supabaseClient.ts already throws in dev if they're absent.
  if (command === 'build' && mode === 'production') {
    assertProductionEnv(env);
  }

  // Base path for the built app. Defaults to root ("/") so an unconfigured
  // deployment serves correctly from a domain root. The GitHub Pages workflow
  // (.github/workflows/deploy-ui.yml) sets VITE_BASE_PATH to "/<repo-name>/"
  // explicitly, so Pages deployments are unaffected by this default.
  const basePath = env.VITE_BASE_PATH || '/';

  // Determine the backend API URL. One FastAPI process (LOMAR_backend) serves
  // both the legacy VTON paths and the versioned /api/v1 application-data
  // routes, so both proxy entries below point at the same target.
  const backendUrl = env.VITE_BACKEND_URL || env.VITE_VTON_BACKEND_URL || 'http://localhost:8080';

  return {
    base: basePath,
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      proxy: {
        '/api/vton': {
          target: backendUrl,
          changeOrigin: true,
          rewrite: (requestPath) => requestPath.replace(/^\/api\/vton/, ''),
        },
        '/api/v1': {
          target: backendUrl,
          changeOrigin: true,
        },
      },
    },
  };
});
