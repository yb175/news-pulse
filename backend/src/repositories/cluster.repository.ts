import prisma from '../lib/prisma';

export class ClusterRepository {
  async getTimeline(cutoffDate?: Date): Promise<any[]> {
    const where: any = {};
    const includeArticlesWhere: any = {};

    if (cutoffDate) {
      where.articles = {
        some: {
          publishedAt: {
            gte: cutoffDate,
          },
        },
      };
      includeArticlesWhere.publishedAt = {
        gte: cutoffDate,
      };
    }

    return prisma.cluster.findMany({
      where,
      include: {
        articles: Object.keys(includeArticlesWhere).length > 0
          ? { where: includeArticlesWhere }
          : true,
      },
    });
  }

  async getClusters(): Promise<any[]> {
    return prisma.cluster.findMany({
      include: {
        articles: {
          select: {
            publishedAt: true,
          },
        },
      },
    });
  }

  async getClusterDetails(id: string): Promise<any | null> {
    return prisma.cluster.findUnique({
      where: { id },
    });
  }
}
