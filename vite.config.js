import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Base relativa para que o build estatico funcione em qualquer host/subpasta.
export default defineConfig({
  base: './',
  plugins: [react()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.js'],
  },
});
