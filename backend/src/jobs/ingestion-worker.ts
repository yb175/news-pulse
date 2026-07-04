import { IngestionService } from '../services/ingestion.service';

export function startIngestionWorker(): { stop: () => void } {
  const service = new IngestionService();
  const INTERVAL_MS = 15 * 60 * 1000; // 15 minutes
  let timeoutId: NodeJS.Timeout | null = null;
  let isStopped = false;

  console.log('[Worker] Ingestion worker initialized. Running scheduled runs.');

  async function run() {
    if (isStopped) return;
    try {
      console.log('[Worker] Triggering scheduled ingestion...');
      const jobId = await service.triggerIngestion();
      console.log(`[Worker] Scheduled ingestion job triggered: ${jobId}`);
    } catch (error) {
      console.error('[Worker] Failed to trigger scheduled ingestion:', error);
    } finally {
      if (!isStopped) {
        timeoutId = setTimeout(run, INTERVAL_MS);
      }
    }
  }

  // Run immediately on startup, which then schedules subsequent runs in the finally block
  run();

  return {
    stop: () => {
      isStopped = true;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      console.log('[Worker] Ingestion worker stopped.');
    },
  };
}
