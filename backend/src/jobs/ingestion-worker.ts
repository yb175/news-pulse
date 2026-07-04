import { IngestionService } from '../services/ingestion.service';

export function startIngestionWorker(): NodeJS.Timeout {
  const service = new IngestionService();
  const INTERVAL_MS = 15 * 60 * 1000; // 15 minutes

  console.log('[Worker] Ingestion worker initialized. Running every 15 minutes.');

  const intervalId = setInterval(async () => {
    try {
      console.log('[Worker] Triggering scheduled ingestion...');
      const jobId = await service.triggerIngestion();
      console.log(`[Worker] Scheduled ingestion job triggered: ${jobId}`);
    } catch (error) {
      console.error('[Worker] Failed to trigger scheduled ingestion:', error);
    }
  }, INTERVAL_MS);

  return intervalId;
}
