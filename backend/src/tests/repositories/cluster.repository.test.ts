import { ClusterRepository } from '../../repositories/cluster.repository';
import prisma from '../../lib/prisma';
import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../../lib/prisma', () => ({
  default: {
    cluster: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

describe('ClusterRepository', () => {
  let repository: ClusterRepository;

  beforeEach(() => {
    repository = new ClusterRepository();
    vi.clearAllMocks();
  });

  describe('getTimeline', () => {
    it('should call findMany with correct date and source filters', async () => {
      const mockClusters = [
        {
          id: 'c1',
          title: 'Title',
          articles: [{ id: 'a1', source: 'BBC News', publishedAt: new Date() }],
        },
      ];
      vi.mocked(prisma.cluster.findMany).mockResolvedValue(mockClusters as any);

      const cutoffDate = new Date('2026-07-04T00:00:00Z');
      const result = await repository.getTimeline(cutoffDate, ['BBC']);

      expect(prisma.cluster.findMany).toHaveBeenCalledWith({
        where: {
          articles: {
            some: {
              publishedAt: { gte: cutoffDate },
              OR: [
                {
                  source: {
                    contains: 'BBC',
                    mode: 'insensitive',
                  },
                },
              ],
            },
          },
        },
        include: {
          articles: {
            where: {
              publishedAt: { gte: cutoffDate },
            },
          },
        },
      });
      expect(result).toEqual(mockClusters);
    });
  });

  describe('getClusters', () => {
    it('should call findMany and calculate summary metadata', async () => {
      const mockClusters = [
        {
          id: 'c1',
          title: 'Cluster One',
          articles: [
            { publishedAt: new Date('2026-07-04T10:00:00Z') },
            { publishedAt: new Date('2026-07-04T12:00:00Z') },
          ],
        },
      ];
      vi.mocked(prisma.cluster.findMany).mockResolvedValue(mockClusters as any);

      const result = await repository.getClusters();

      expect(prisma.cluster.findMany).toHaveBeenCalledWith({
        include: {
          articles: {
            select: { publishedAt: true },
          },
        },
      });

      expect(result[0]).toEqual({
        id: 'c1',
        label: 'Cluster One',
        articleCount: 2,
        timeRange: {
          start: new Date('2026-07-04T10:00:00Z').toISOString(),
          end: new Date('2026-07-04T12:00:00Z').toISOString(),
        },
      });
    });
  });

  describe('getClusterDetails', () => {
    it('should call findUnique with correct ID and includes', async () => {
      const mockCluster = {
        id: 'c1',
        title: 'Cluster One',
        articles: [],
      };
      vi.mocked(prisma.cluster.findUnique).mockResolvedValue(mockCluster as any);

      const result = await repository.getClusterDetails('c1');

      expect(prisma.cluster.findUnique).toHaveBeenCalledWith({
        where: { id: 'c1' },
        include: { articles: true },
      });
      expect(result).toEqual(mockCluster);
    });
  });
});
