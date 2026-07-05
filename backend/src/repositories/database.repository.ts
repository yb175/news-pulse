import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma';

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
}
