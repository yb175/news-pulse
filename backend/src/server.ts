import dotenv from 'dotenv';
import path from 'path';

// Load environmental variables from root monorepo directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import app from './app';
import { startIngestionWorker } from './jobs/ingestion-worker';

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`[Server] News Pulse Backend listening on port ${PORT}`);
});

const worker = startIngestionWorker();

// Graceful shutdown
function shutdown() {
  console.log('[Server] Shutting down gracefully...');
  worker.stop();
  server.close(() => {
    console.log('[Server] HTTP server closed.');
    process.exit(0);
  });
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
