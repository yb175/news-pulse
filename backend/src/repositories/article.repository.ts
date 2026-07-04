import prisma from '../lib/prisma';

export class ArticleRepository {
  async findByCluster(clusterId: string): Promise<any[]> {
    return prisma.article.findMany({
      where: { clusterId },
    });
  }
}
