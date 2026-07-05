import cron from 'node-cron';
import { CleanupService } from '../services/cleanup.service';

export function startCleanupJob(): { stop: () => void; trigger: () => Promise<void> } {
  const service = new CleanupService();

  // Validate cron expression
  let cronExpression = process.env.CLEANUP_CRON || '0 * * * *';
  if (!cron.validate(cronExpression)) {
    console.error(`[Cleanup] Invalid CLEANUP_CRON expression: "${cronExpression}". Falling back to default "0 * * * *".`);
    cronExpression = '0 * * * *';
  }

  // Validate retention window config
  const rawRetention = process.env.NEWS_RETENTION_HOURS || '24';
  let retentionHours = parseInt(rawRetention, 10);
  if (isNaN(retentionHours) || retentionHours <= 0) {
    console.warn(`[Cleanup] Invalid NEWS_RETENTION_HOURS: "${rawRetention}". Must be a positive integer. Falling back to 24 hours.`);
    retentionHours = 24;
  }

  console.log(`[Cleanup] Cleanup job initialized with schedule: ${cronExpression}`);

  async function runCleanup() {
    try {
      console.log('Starting cleanup job...');
      console.log(`Retention Window: ${retentionHours} hours`);

      const startTime = Date.now();
      const result = await service.cleanupExpiredData(retentionHours);
      const duration = Date.now() - startTime;

      console.log(`Deleted ${result.deletedArticles} articles`);
      console.log(`Deleted ${result.deletedClusters} orphaned clusters`);
      console.log(`Cleanup completed in ${duration} ms`);
    } catch (error) {
      console.error('[Cleanup] Failed to run cleanup job:', error);
    }
  }

  // Schedule the cron task with overlap prevention enabled
  const task = cron.schedule(cronExpression, runCleanup, { noOverlap: true });

  return {
    stop: () => {
      task.stop();
      console.log('[Cleanup] Cleanup job stopped.');
    },
    trigger: runCleanup,
  };
}
