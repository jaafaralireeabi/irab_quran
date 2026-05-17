import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.[jt]sx?$/,
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
});

export default defineConfig({
  plugins: [react()],
  base: '/[https://github.com/jaafaralireeabi/irab_quran.git]/', // أضف هذا السطر واكتب اسم المستودع الخاص بك
})
