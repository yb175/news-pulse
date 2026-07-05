import cron from 'node-cron';
import { CleanupService } from '../services/cleanup.service';

export function startCleanupJob(): { stop: () => void; trigger: () => Promise<void> } {
  const service = new CleanupService();
  const cronExpression = process.env.CLEANUP_CRON || '0 * * * *';
  const retentionHours = parseInt(process.env.NEWS_RETENTION_HOURS || '24', 10);

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

  // Schedule the cron task
  const task = cron.schedule(cronExpression, runCleanup);

  return {
    stop: () => {
      task.stop();
      console.log('[Cleanup] Cleanup job stopped.');
    },
    trigger: runCleanup,
  };
}
