import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { VitePWA } from 'vite-plugin-pwa';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 기본은 HTTP. HTTPS=1 이면 로컬 인증서로 HTTPS 서버를 띄운다 (npm run dev:https)
// 실기기 카메라/마이크 테스트용
const keyPath = path.resolve(__dirname, 'certs/key.pem');
const certPath = path.resolve(__dirname, 'certs/cert.pem');
const https =
  process.env.HTTPS && fs.existsSync(keyPath) && fs.existsSync(certPath)
    ? { key: fs.readFileSync(keyPath), cert: fs.readFileSync(certPath) }
    : undefined;

// https://vite.dev/config/
export default defineConfig({
  server: {
    https,
  },
  plugins: [
    react(),
    VitePWA({
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MB
      },
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', '180.png', '192.png', '512.png'],
      manifest: {
        name: '또박한글',
        short_name: '또박한글',
        description: '또박한글 특수교육용 한글학습',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#317EFB',
        icons: [
          {
            src: '192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
