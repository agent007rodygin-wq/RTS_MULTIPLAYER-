import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
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
      // 2026-11 security pass:
      // - the previous `define` block inlined GEMINI_API_KEY into the client
      //   bundle as a compile-time constant; client code never reads
      //   process.env (verified), so it was removed — API keys must never
      //   reach the browser.
      // - `build.sourcemap: false` keeps original TS/TSX sources out of the
      //   production bundle (source maps used to ship full sourcesContent).
      // - esbuild drops debugger statements and pure console.log/info/debug
      //   calls (error/warn kept for production diagnostics). Build-time only,
      //   no runtime FPS impact.
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      esbuild: {
        drop: ['debugger'],
        pure: ['console.log', 'console.info', 'console.debug']
      },
      build: {
        outDir: 'dist',
        sourcemap: false,
        chunkSizeWarningLimit: 2000
      }
    };
});
