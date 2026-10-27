import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import cors from 'cors';
import apiRouter from './server/routes.ts';
import { initDatabase } from './server/db.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging for emergency ops audit
app.use((req, _res, next) => {
  if (req.path.startsWith('/api') || req.path === '/health') {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  }
  next();
});

// Mount disaster management REST API
app.use(apiRouter);

async function startServer() {
  // Initialize database (MongoDB Atlas or Demonstration Store)
  const dbStatus = await initDatabase();
  console.log(`[CycloneShield Core] Storage Engine: ${dbStatus.mode}`);

  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    // Mount Vite dev server middlewares
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('[CycloneShield Core] Mounted Vite development middleware with hot module evaluation.');
  } else {
    // Serve production static build if available, or API status
    const distPath = path.resolve(__dirname, 'dist');
    const indexHtml = path.resolve(distPath, 'index.html');
    if (fs.existsSync(indexHtml)) {
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(indexHtml);
      });
    } else {
      app.get('/', (_req, res) => {
        res.json({
          status: 'online',
          service: 'CycloneShield Emergency Management API',
          timestamp: new Date().toISOString(),
          endpoints: {
            health: '/health',
            cyclones: '/api/cyclones',
            shelters: '/api/shelters',
            relief: '/api/relief/inventory',
            alerts: '/api/alerts',
            tasks: '/api/tasks'
          }
        });
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CycloneShield Server] Emergency Command Platform listening on http://localhost:${PORT} (or http://0.0.0.0:${PORT})`);
  });
}

startServer().catch((err) => {
  console.error('[CycloneShield Server] Fatal startup error:', err);
  process.exit(1);
});
