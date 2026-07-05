import { DatabaseRepository } from '../repositories/database.repository';
import prisma from '../lib/prisma';

export interface CleanupResult {
  deletedArticles: number;
  deletedClusters: number;
}

export class CleanupService {
  private repository = new DatabaseRepository();

  async cleanupExpiredData(retentionHours: number): Promise<CleanupResult> {
    const cutoff = new Date(Date.now() - retentionHours * 60 * 60 * 1000);

    return prisma.$transaction(async (tx) => {
      const deletedArticles = await this.repository.deleteExpiredArticles(cutoff, tx);
      const deletedClusters = await this.repository.deleteEmptyClusters(tx);

      return {
        deletedArticles,
        deletedClusters,
      };
    });
  }
}
