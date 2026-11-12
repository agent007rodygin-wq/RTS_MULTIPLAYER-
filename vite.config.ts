import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const proxyConfig = {
      '/api': {
        target: 'http://127.0.0.1:8090',
        changeOrigin: true,
        timeout: 0,
        proxyTimeout: 0,
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes, req, res) => {
            if (req.url && req.url.includes('/realtime')) {
              res.setHeader('X-Accel-Buffering', 'no');
              res.setHeader('Cache-Control', 'no-cache, no-transform');
            }
          });
        }
      }
    };

    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        allowedHosts: true,
        proxy: proxyConfig
      },
      preview: {
        port: 3000,
        host: '0.0.0.0',
        allowedHosts: true,
        proxy: proxyConfig
      },
      plugins: [
        react(),
        {
          name: 'static-assets-cache-control',
          configureServer(server) {
            server.middlewares.use((req, res, next) => {
              const url = req.url || '';
              if (
                url.startsWith('/buildings/') ||
                url.startsWith('/animation/') ||
                url.startsWith('/music/') ||
                url.startsWith('/last_appx/') ||
                url.startsWith('/Grid/') ||
                url.startsWith('/Gui/') ||
                url.startsWith('/Chat/') ||
                url.startsWith('/assets/') ||
                /\.(webp|png|jpg|jpeg|gif|svg|mp3|mp4|wav|ogg|woff2?)$/i.test(url)
              ) {
                res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
              }
              next();
            });
          },
          configurePreviewServer(server) {
            server.middlewares.use((req, res, next) => {
              const url = req.url || '';
              if (!url.startsWith('/assets/') && !url.endsWith('.webp')) {
                console.log('[REQ]', req.method, url);
              }
              if (
                url.startsWith('/buildings/') ||
                url.startsWith('/animation/') ||
                url.startsWith('/music/') ||
                url.startsWith('/last_appx/') ||
                url.startsWith('/Grid/') ||
                url.startsWith('/Gui/') ||
                url.startsWith('/Chat/') ||
                url.startsWith('/assets/') ||
                /\.(webp|png|jpg|jpeg|gif|svg|mp3|mp4|wav|ogg|woff2?)$/i.test(url)
              ) {
                res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
              }
              next();
            });
          }
        }
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        outDir: 'dist',
        sourcemap: true,
        chunkSizeWarningLimit: 2000
      }
    };
});
