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
    it('should call findMany with correct date filters', async () => {
      const mockClusters = [
        {
          id: 'c1',
          title: 'Title',
          articles: [{ id: 'a1', source: 'BBC News', publishedAt: new Date() }],
        },
      ];
      vi.mocked(prisma.cluster.findMany).mockResolvedValue(mockClusters as any);

      const cutoffDate = new Date('2026-07-04T00:00:00Z');
      const result = await repository.getTimeline(cutoffDate);

      expect(prisma.cluster.findMany).toHaveBeenCalledWith({
        where: {
          articles: {
            some: {
              publishedAt: { gte: cutoffDate },
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
    it('should call findMany with articles publishedAt select', async () => {
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

      expect(result).toEqual(mockClusters);
    });
  });

  describe('getClusterDetails', () => {
    it('should call findUnique with correct ID and no includes', async () => {
      const mockCluster = {
        id: 'c1',
        title: 'Cluster One',
      };
      vi.mocked(prisma.cluster.findUnique).mockResolvedValue(mockCluster as any);

      const result = await repository.getClusterDetails('c1');

      expect(prisma.cluster.findUnique).toHaveBeenCalledWith({
        where: { id: 'c1' },
      });
      expect(result).toEqual(mockCluster);
    });
  });
});
