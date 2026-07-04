import { ClusterService } from '../../services/cluster.service';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('ClusterService', () => {
  let service: ClusterService;
  let mockGetClusters: any;

  beforeEach(() => {
    service = new ClusterService();
    mockGetClusters = vi.fn();
    (service as any).clusterRepository = {
      getClusters: mockGetClusters,
    };
  });

  it('should return cluster summaries sorted by timeRange.start DESC', async () => {
    const mockSummaries = [
      {
        id: 'c1',
        label: 'Older Event',
        articleCount: 1,
        timeRange: {
          start: '2026-07-04T10:00:00Z',
          end: '2026-07-04T11:00:00Z',
        },
      },
      {
        id: 'c2',
        label: 'Empty Event',
        articleCount: 0,
        timeRange: null,
      },
      {
        id: 'c3',
        label: 'Newer Event',
        articleCount: 2,
        timeRange: {
          start: '2026-07-04T12:00:00Z',
          end: '2026-07-04T13:00:00Z',
        },
      },
    ];

    mockGetClusters.mockResolvedValue(mockSummaries);

    const result = await service.getAllClusters();

    expect(result.length).toBe(3);
    // Expected order: c3 (Newer Event), c1 (Older Event), c2 (Empty Event)
    expect(result[0].id).toBe('c3');
    expect(result[1].id).toBe('c1');
    expect(result[2].id).toBe('c2');
  });

  describe('getClusterDetails', () => {
    let mockGetClusterDetails: any;

    beforeEach(() => {
      mockGetClusterDetails = vi.fn();
      (service as any).clusterRepository.getClusterDetails = mockGetClusterDetails;
    });

    it('should return null if cluster is not found', async () => {
      mockGetClusterDetails.mockResolvedValue(null);
      const result = await service.getClusterDetails('missing-id');
      expect(result).toBeNull();
    });

    it('should map articles and sort them by publishedAt DESC', async () => {
      const mockCluster = {
        id: 'c1',
        title: 'Cluster Title',
        articles: [
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
        ],
      };

      mockGetClusterDetails.mockResolvedValue(mockCluster);

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
        articles: [],
      };

      mockGetClusterDetails.mockResolvedValue(mockCluster);

      const result = await service.getClusterDetails('c2');

      expect(result).not.toBeNull();
      expect(result!.articles).toEqual([]);
    });
  });
});
