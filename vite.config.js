import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import path from 'node:path';

export default defineConfig({
  base: './',
  plugins: [react()],
  resolve: { alias: { '@': path.resolve('src') } },
  css: { postcss: { plugins: [tailwindcss('./tailwind.config.js'), autoprefixer()] } },
  server: { port: 5173, strictPort: true },
});
