// vite.config.ts
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import fouriaPackageJson from './GAMES/Fouria-main/package.json';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';
import { arclineAssets } from './scripts/arcline-assets';

const fromRoot = (path: string) => fileURLToPath(new URL(path, import.meta.url));
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, fromRoot('./'), 'FOURIA_');
  const proxy = {
    '/play/fouria/ws': {
      target: `ws://127.0.0.1:${process.env.FOURIA_PORT || env.FOURIA_PORT || 3009}`,
      ws: true,
    },
  };
  return {
  plugins: [react(), tailwindcss(), arclineAssets()],
  define: { __APP_VERSION__: JSON.stringify(fouriaPackageJson.version) },
  resolve: {
    alias: { '@arcline/shared': fromRoot('./GAMES/arcline-1/packages/shared/src/index.ts') },
    dedupe: ['react', 'react-dom', 'phaser'],
  },
  server: { proxy },
  preview: { proxy },
  build: {
    rollupOptions: {
      input: {
        losg: fromRoot('./index.html'),
        arcline: fromRoot('./play/arcline/index.html'),
        snake: fromRoot('./play/snake/index.html'),
        dustbound: fromRoot('./play/dustbound/index.html'),
        fouria: fromRoot('./play/fouria/index.html'),
      },
    },
  },
  };
});
