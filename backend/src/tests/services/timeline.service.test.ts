import { TimelineService } from '../../services/timeline.service';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('TimelineService', () => {
  let service: TimelineService;
  let mockRepositoryGet: any;

  const mockClusters = [
    {
      id: 'c1',
      title: 'AI Standard Alliance',
      articles: [
        { id: 'a1', source: 'BBC News', publishedAt: new Date('2026-07-04T12:00:00Z') },
        { id: 'a2', source: 'The Guardian', publishedAt: new Date('2026-07-04T10:00:00Z') }
      ]
    },
    {
      id: 'c2',
      title: 'Green Energy Surge',
      articles: [
        { id: 'a3', source: 'NPR', publishedAt: new Date('2026-07-04T08:00:00Z') },
        { id: 'a4', source: 'Reuters', publishedAt: new Date('2026-07-04T14:00:00Z') }
      ]
    }
  ];

  beforeEach(() => {
    service = new TimelineService();
    mockRepositoryGet = vi.fn();
    (service as any).clusterRepository = {
      getTimeline: mockRepositoryGet,
    };
  });

  it('should map entities into DTOs and aggregate article metadata correctly', async () => {
    mockRepositoryGet.mockResolvedValue(mockClusters);

    const result = await service.getTimeline(7);

    expect(mockRepositoryGet).toHaveBeenCalled();
    expect(result.length).toBe(2);

    // Cluster 1 aggregation checks
    const dto1 = result.find(d => d.clusterId === 'c1')!;
    expect(dto1.label).toBe('AI Standard Alliance');
    expect(dto1.startTime).toBe(new Date('2026-07-04T10:00:00Z').toISOString());
    expect(dto1.endTime).toBe(new Date('2026-07-04T12:00:00Z').toISOString());
    expect(dto1.articleCount).toBe(2);

    // Cluster 2 aggregation checks
    const dto2 = result.find(d => d.clusterId === 'c2')!;
    expect(dto2.label).toBe('Green Energy Surge');
    expect(dto2.startTime).toBe(new Date('2026-07-04T08:00:00Z').toISOString());
    expect(dto2.endTime).toBe(new Date('2026-07-04T14:00:00Z').toISOString());
    expect(dto2.articleCount).toBe(2);
  });

  it('should apply source filtering correctly', async () => {
    mockRepositoryGet.mockResolvedValue(mockClusters);

    // Filter by "BBC"
    const bbcResult = await service.getTimeline(7, ['BBC']);
    expect(bbcResult.length).toBe(1);
    expect(bbcResult[0].clusterId).toBe('c1');

    // Filter by "NPR"
    const nprResult = await service.getTimeline(7, ['NPR']);
    expect(nprResult.length).toBe(1);
    expect(nprResult[0].clusterId).toBe('c2');

    // Filter by "Guardian, Reuters"
    const mixedResult = await service.getTimeline(7, ['Guardian', 'Reuters']);
    expect(mixedResult.length).toBe(2);
  });

  it('should order timeline items by startTime DESC', async () => {
    mockRepositoryGet.mockResolvedValue(mockClusters);

    const result = await service.getTimeline(7);

    // C1: startTime = 10:00:00Z
    // C2: startTime = 08:00:00Z
    // C1 should come first because 10:00 is later than 08:00 (startTime DESC)
    expect(result[0].clusterId).toBe('c1');
    expect(result[1].clusterId).toBe('c2');
  });
});
