import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, Plugin} from 'vite';
import dotenv from 'dotenv';

dotenv.config();

function apiServerlessPlugin(): Plugin {
  return {
    name: 'api-serverless-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith('/api/')) {
          try {
            const urlObj = new URL(req.url, 'http://localhost');
            const cleanPath = urlObj.pathname.replace(/^\/api\//, '').replace(/\/$/, '');
            const filePath = path.resolve(process.cwd(), 'api', `${cleanPath}.js`);
            const mod = await import(/* @vite-ignore */ `${filePath}?t=${Date.now()}`);
            if (mod && mod.default) {
              return await mod.default(req, res);
            }
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({
              error: 'Internal Server Error',
              reason: err.message || 'Error executing API route'
            }));
          }
        }
        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiServerlessPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
