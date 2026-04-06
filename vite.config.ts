import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5969,
    headers: {
      // Vite 7.x 기본 COOP(same-origin) 설정이 Google OAuth postMessage를 차단하므로 완화
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    },
  },
  resolve: {
    alias: [
      // 레이어 네임스페이스 (index.ts로 직접 매핑)
      { find: /^@widgets$/, replacement: path.resolve(__dirname, './src/widgets/index.ts') },
      { find: /^@features$/, replacement: path.resolve(__dirname, './src/features/index.ts') },
      { find: /^@entities$/, replacement: path.resolve(__dirname, './src/entities/index.ts') },
      { find: /^@shared$/, replacement: path.resolve(__dirname, './src/shared/index.ts') },
      // 레이어 하위 경로
      { find: '@widgets', replacement: path.resolve(__dirname, './src/widgets') },
      { find: '@features', replacement: path.resolve(__dirname, './src/features') },
      { find: '@entities', replacement: path.resolve(__dirname, './src/entities') },
      { find: '@shared', replacement: path.resolve(__dirname, './src/shared') },
      { find: '@app', replacement: path.resolve(__dirname, './src/app') },
      // 기본 경로
      { find: '@', replacement: path.resolve(__dirname, './src') },
    ],
  },
});
