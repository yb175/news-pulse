import { ClusterService } from '../../services/cluster.service';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('ClusterService', () => {
  let service: ClusterService;
  let mockGetClusters: any;
  let mockGetClusterDetails: any;
  let mockFindByCluster: any;

  beforeEach(() => {
    service = new ClusterService();
    mockGetClusters = vi.fn();
    mockGetClusterDetails = vi.fn();
    mockFindByCluster = vi.fn();

    (service as any).clusterRepository = {
      getClusters: mockGetClusters,
      getClusterDetails: mockGetClusterDetails,
    };
    (service as any).articleRepository = {
      findByCluster: mockFindByCluster,
    };
  });

  it('should return cluster summaries sorted by timeRange.start DESC', async () => {
    const mockRawClusters = [
      {
        id: 'c1',
        title: 'Older Event',
        articles: [
          { publishedAt: new Date('2026-07-04T10:00:00Z') },
        ],
      },
      {
        id: 'c2',
        title: 'Empty Event',
        articles: [],
      },
      {
        id: 'c3',
        title: 'Newer Event',
        articles: [
          { publishedAt: new Date('2026-07-04T12:00:00Z') },
          { publishedAt: new Date('2026-07-04T13:00:00Z') },
        ],
      },
    ];

    mockGetClusters.mockResolvedValue(mockRawClusters);

    const result = await service.getAllClusters();

    expect(result.length).toBe(3);
    // Expected order: c3 (Newer Event), c1 (Older Event), c2 (Empty Event)
    expect(result[0].id).toBe('c3');
    expect(result[0].articleCount).toBe(2);
    expect(result[0].timeRange).toEqual({
      start: new Date('2026-07-04T12:00:00Z').toISOString(),
      end: new Date('2026-07-04T13:00:00Z').toISOString(),
    });

    expect(result[1].id).toBe('c1');
    expect(result[1].articleCount).toBe(1);

    expect(result[2].id).toBe('c2');
    expect(result[2].timeRange).toBeNull();
  });

  describe('getClusterDetails', () => {
    it('should return null if cluster is not found', async () => {
      mockGetClusterDetails.mockResolvedValue(null);
      const result = await service.getClusterDetails('missing-id');
      expect(result).toBeNull();
    });

    it('should map articles and sort them by publishedAt DESC', async () => {
      const mockCluster = {
        id: 'c1',
        title: 'Cluster Title',
      };
      const mockArticles = [
        {
          id: 'a1',
          title: 'Article 1',
          bodySnippet: 'Snippet 1',
          source: 'BBC',
          url: 'http://bbc.com',
          publishedAt: new Date('2026-07-04T10:00:00Z'),
        },
        {
          id: 'a2',
          title: 'Article 2',
          bodySnippet: 'Snippet 2',
          source: 'CNN',
          url: 'http://cnn.com',
          publishedAt: new Date('2026-07-04T12:00:00Z'),
        },
      ];

      mockGetClusterDetails.mockResolvedValue(mockCluster);
      mockFindByCluster.mockResolvedValue(mockArticles);

      const result = await service.getClusterDetails('c1');

      expect(result).not.toBeNull();
      expect(result!.id).toBe('c1');
      expect(result!.label).toBe('Cluster Title');
      expect(result!.articles.length).toBe(2);

      // Verify mapping and sorting (a2 at 12:00 should come before a1 at 10:00)
      expect(result!.articles[0].id).toBe('a2');
      expect(result!.articles[0].summary).toBe('Snippet 2'); // bodySnippet mapped to summary
      expect(result!.articles[0].publishedAt).toBe(new Date('2026-07-04T12:00:00Z').toISOString());

      expect(result!.articles[1].id).toBe('a1');
      expect(result!.articles[1].summary).toBe('Snippet 1');
    });

    it('should handle empty clusters (no articles) correctly', async () => {
      const mockCluster = {
        id: 'c2',
        title: 'Empty Cluster',
      };

      mockGetClusterDetails.mockResolvedValue(mockCluster);
      mockFindByCluster.mockResolvedValue([]);

      const result = await service.getClusterDetails('c2');

      expect(result).not.toBeNull();
      expect(result!.articles).toEqual([]);
    });

    it('should sanitize article summaries to clean plain text', async () => {
      const mockCluster = { id: 'c1', title: 'Test Cluster' };
      const mockArticles = [
        {
          id: 'a1',
          title: 'Article with HTML',
          bodySnippet: '<ul><li><p>South Africa 45-21 England</p></li></ul>\n<p>What a fabulous occasion...</p>\n<a href="http://example.com">Continue reading...</a>',
          source: 'BBC',
          url: 'http://bbc.com',
          publishedAt: new Date('2026-07-04T10:00:00Z'),
        },
        {
          id: 'a2',
          title: 'Article with Entities and Links',
          bodySnippet: 'The &ldquo;Springboks&rdquo; won &amp; defeated their opponent. <a href="http://link.com">Read original</a>',
          source: 'NPR',
          url: 'http://npr.org',
          publishedAt: new Date('2026-07-04T11:00:00Z'),
        }
      ];

      mockGetClusterDetails.mockResolvedValue(mockCluster);
      mockFindByCluster.mockResolvedValue(mockArticles);

      const result = await service.getClusterDetails('c1');

      expect(result).not.toBeNull();
      // a2 has newer date (11:00) so it's first
      expect(result!.articles[0].summary).toBe('The “Springboks” won & defeated their opponent. Read original');
      
      // a1 has older date (10:00) so it's second
      expect(result!.articles[1].summary).toBe('• South Africa 45-21 England\n\nWhat a fabulous occasion...');
    });
  });
});
