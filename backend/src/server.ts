import dotenv from 'dotenv';
import path from 'path';

// Load environmental variables from root monorepo directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import app from './app';
import { startIngestionWorker } from './jobs/ingestion-worker';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[Server] News Pulse Backend listening on port ${PORT}`);
  startIngestionWorker();
});
