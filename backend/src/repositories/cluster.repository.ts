import prisma from '../lib/prisma';

export class ClusterRepository {
  async getTimeline(cutoffDate?: Date, sources?: string[]): Promise<any[]> {
    const where: any = {};
    const articleFilter: any = {};

    if (cutoffDate) {
      articleFilter.publishedAt = {
        gte: cutoffDate,
      };
    }

    if (sources && sources.length > 0) {
      articleFilter.OR = sources.map(source => ({
        source: {
          contains: source,
          mode: 'insensitive',
        },
      }));
    }

    if (cutoffDate || (sources && sources.length > 0)) {
      where.articles = {
        some: articleFilter,
      };
    }

    const includeArticlesWhere: any = {};
    if (cutoffDate) {
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
    const clusters = await prisma.cluster.findMany({
      include: {
        articles: {
          select: {
            publishedAt: true,
          },
        },
      },
    });

    return clusters.map(cluster => {
      const articles = cluster.articles || [];
      const articleCount = articles.length;

      let timeRange = null;
      if (articles.length > 0) {
        const dates = articles.map(a => new Date(a.publishedAt).getTime());
        timeRange = {
          start: new Date(Math.min(...dates)).toISOString(),
          end: new Date(Math.max(...dates)).toISOString(),
        };
      }

      return {
        id: cluster.id,
        label: cluster.title,
        articleCount,
        timeRange,
      };
    });
  }

  async getClusterDetails(id: string): Promise<any | null> {
    return prisma.cluster.findUnique({
      where: { id },
      include: {
        articles: true,
      },
    });
  }
}
