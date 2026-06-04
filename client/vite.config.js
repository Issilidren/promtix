import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Promtix',
        short_name: 'Promtix',
        description: 'Master the art of AI prompting. Outprompt your rivals.',
        theme_color: '#06b6d4',
        background_color: '#020617',
        display: 'standalone',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /\/api\/game\/challenges/,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'challenges-cache' }
          }
        ]
      }
    })
  ],
  server: {
    // Express server (npm run dev) — proxies /api and /auth to local Express
    // Vercel dev (npm run dev:vercel) — handles /api natively, no proxy needed
    proxy: process.env.USE_EXPRESS
      ? { '/api': 'http://localhost:3001', '/auth': 'http://localhost:3001' }
      : {}
  }
});
