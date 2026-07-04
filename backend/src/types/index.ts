export interface TimelineItem {
  id: string;
  timestamp: string;
  cluster: {
    id: string;
    title: string;
    summary: string | null;
    articleCount: number;
    articles: Array<{
      id: string;
      title: string;
      source: string;
      url: string;
      publishedAt: Date;
    }>;
  };
}
