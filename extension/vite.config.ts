import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { crx } from '@crxjs/vite-plugin';
import manifest from './manifest.json';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    crx({ manifest: manifest as any }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, '../shared/src'),
    },
  },
  build: {
    rollupOptions: {
      input: {
        popup: path.resolve(__dirname, 'src/ui/popup/popup.html'),
        options: path.resolve(__dirname, 'src/ui/options/options.html'),
      },
    },
  },
});
