import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma';

export interface CleanupResult {
  deletedArticles: number;
  deletedClusters: number;
}

export class DatabaseRepository {
  async deleteExpiredArticles(cutoff: Date, tx: Prisma.TransactionClient = prisma): Promise<number> {
    const result = await tx.article.deleteMany({
      where: {
        publishedAt: {
          lt: cutoff,
        },
      },
    });
    return result.count;
  }

  async deleteEmptyClusters(tx: Prisma.TransactionClient = prisma): Promise<number> {
    const result = await tx.cluster.deleteMany({
      where: {
        articles: {
          none: {},
        },
      },
    });
    return result.count;
  }

  async cleanupExpired(cutoff: Date): Promise<CleanupResult> {
    return prisma.$transaction(async (tx) => {
      const deletedArticles = await this.deleteExpiredArticles(cutoff, tx);
      const deletedClusters = await this.deleteEmptyClusters(tx);
      return {
        deletedArticles,
        deletedClusters,
      };
    });
  }
}
