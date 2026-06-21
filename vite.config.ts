import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  
  // Determine the base path for GitHub Pages
  // Can be overridden via VITE_BASE_PATH environment variable
  const basePath = env.VITE_BASE_PATH || '/LOMAR/';
  
  // Determine the backend API URL
  // For production (GitHub Pages), set VITE_VTON_BACKEND_URL to your Cloud Run URL
  const backendUrl = env.VITE_VTON_BACKEND_URL || 'http://localhost:3003';

  return {
    base: basePath,
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
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
      },
    },
  };
});
