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
        summary: sanitizeSummary(article.bodySnippet),
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

function sanitizeSummary(html: string): string {
  if (!html) return '';

  let text = html;

  // 1. Remove unwanted elements and their contents completely: script, style, iframe
  text = text.replace(/<(script|style|iframe)[^>]*>[\s\S]*?<\/\1>/gi, '');

  // 2. Remove "Continue reading" style anchors completely
  text = text.replace(/<a[^>]*>(Continue reading|Read more|Full story)\.{0,3}\s*<\/a>/gi, '');

  // 3. Keep inner text of other anchors but strip the tags
  text = text.replace(/<a[^>]*>([\s\S]*?)<\/a>/gi, '$1');

  // 4. Convert list items to bullet points
  text = text.replace(/<li>/gi, '\n• ');
  text = text.replace(/<\/li>/gi, '');

  // 5. Convert structural margins and breaks to newlines
  text = text.replace(/<\/p>/gi, '\n\n');
  text = text.replace(/<\/div>/gi, '\n\n');
  text = text.replace(/<br\s*\/?>/gi, '\n');

  // 6. Strip all remaining HTML tags
  text = text.replace(/<[^>]+>/g, '');

  // 7. Decode HTML entities
  const htmlEntities: { [key: string]: string } = {
    '&nbsp;': ' ',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&apos;': "'",
    '&#39;': "'",
    '&#x27;': "'",
    '&#x2F;': '/',
    '&#96;': '`',
    '&#x3D;': '=',
    '&ndash;': '–',
    '&mdash;': '—',
    '&lsquo;': '‘',
    '&raquo;': '»',
    '&laquo;': '«',
    '&rsquo;': '’',
    '&ldquo;': '“',
    '&rdquo;': '”',
    '&#8211;': '–',
    '&#8212;': '—',
    '&#8216;': '‘',
    '&#8217;': '’',
    '&#8220;': '“',
    '&#8221;': '”',
  };

  text = text.replace(/&[#\w\d]+;/g, (entity) => {
    return htmlEntities[entity] || htmlEntities[entity.toLowerCase()] || entity;
  });

  // 8. Clean up whitespace and collapsing newlines
  text = text.replace(/\n{3,}/g, '\n\n');
  text = text.split('\n').map(line => line.trim()).join('\n');
  text = text.trim();

  return text;
}