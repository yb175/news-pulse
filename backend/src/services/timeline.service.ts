import { ClusterRepository } from '../repositories/cluster.repository';

export interface TimelineDTO {
  clusterId: string;
  label: string;
  startTime: string;
  endTime: string;
  articleCount: number;
}

export class TimelineService {
  private clusterRepository = new ClusterRepository();

  async getTimeline(days: number = 7, sources?: string[]): Promise<TimelineDTO[]> {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Fetch clusters from repository
    const clusters = await this.clusterRepository.getTimeline(cutoffDate, sources);

    // Apply source filter: Only include clusters containing articles from those sources
    let filteredClusters = clusters;
    if (sources && sources.length > 0) {
      const lowercaseSources = sources.map(s => s.toLowerCase());
      filteredClusters = clusters.filter(cluster =>
        cluster.articles && cluster.articles.some((article: any) =>
          lowercaseSources.some(src => article.source.toLowerCase().includes(src))
        )
      );
    }

    // Map entities into DTOs and aggregate article metadata
    const dtos: TimelineDTO[] = filteredClusters
      .map(cluster => {
        if (!cluster.articles || cluster.articles.length === 0) {
          return null;
        }

        const publishedDates = cluster.articles.map((a: any) => new Date(a.publishedAt).getTime());
        const startTime = new Date(Math.min(...publishedDates)).toISOString();
        const endTime = new Date(Math.max(...publishedDates)).toISOString();
        const articleCount = cluster.articles.length;

        return {
          clusterId: cluster.id,
          label: cluster.title,
          startTime,
          endTime,
          articleCount,
        };
      })
      .filter((dto): dto is TimelineDTO => dto !== null);

    // Order timeline by: startTime DESC
    dtos.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

    return dtos;
  }
}