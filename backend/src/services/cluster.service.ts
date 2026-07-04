import { ClusterRepository } from '../repositories/cluster.repository';
import { ArticleRepository } from '../repositories/article.repository';

export interface ClusterSummaryDTO {
  id: string;
  label: string;
  articleCount: number;
  timeRange: {
    start: string;
    end: string;
  } | null;
}

export interface ClusterDetailsDTO {
  id: string;
  label: string;
  articles: Array<{
    id: string;
    title: string;
    summary: string;
    source: string;
    url: string;
    publishedAt: string;
  }>;
}

export class ClusterService {
  private clusterRepository = new ClusterRepository();
  private articleRepository = new ArticleRepository();

  async getAllClusters(): Promise<ClusterSummaryDTO[]> {
    const clusters = await this.clusterRepository.getClusters();

    const summaries: ClusterSummaryDTO[] = clusters.map(cluster => {
      const articles = cluster.articles || [];
      const articleCount = articles.length;

      let timeRange = null;
      if (articles.length > 0) {
        const dates = articles.map((a: any) => new Date(a.publishedAt).getTime());
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

    // Sort summaries by timeRange.start DESC.
    // Clusters with no articles (no timeRange) are pushed to the end.
    summaries.sort((a: ClusterSummaryDTO, b: ClusterSummaryDTO) => {
      if (!a.timeRange && !b.timeRange) return 0;
      if (!a.timeRange) return 1;
      if (!b.timeRange) return -1;
      return new Date(b.timeRange.start).getTime() - new Date(a.timeRange.start).getTime();
    });

    return summaries;
  }

  async getClusterDetails(id: string): Promise<ClusterDetailsDTO | null> {
    const cluster = await this.clusterRepository.getClusterDetails(id);
    if (!cluster) {
      return null;
    }

    const rawArticles = await this.articleRepository.findByCluster(id);

    const articles = rawArticles
      .map((article: any) => ({
        id: article.id,
        title: article.title,
        summary: article.bodySnippet,
        source: article.source,
        url: article.url,
        publishedAt: new Date(article.publishedAt).toISOString(),
      }))
      .sort((a: any, b: any) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    return {
      id: cluster.id,
      label: cluster.title,
      articles,
    };
  }
}