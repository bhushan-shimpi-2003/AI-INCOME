import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'express-backend-middleware',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.url && (req.url.startsWith('/api') || req.url.startsWith('/health'))) {
            try {
              const { default: app } = await import('./backend/app.js');
              return app(req, res, next);
            } catch (err) {
              console.error('API middleware error:', err);
              return next(err);
            }
          }
          next();
        });
      }
    }
  ],
  server: {
    port: 5173,
    host: true,
    watch: {
      ignored: ['**/*.~tmp', '**/*.tmp', '**/.*', '**/*.log']
    }
  }
});
