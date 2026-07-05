import { DatabaseRepository } from '../../repositories/database.repository';
import prisma from '../../lib/prisma';
import { describe, it, expect, beforeEach, vi } from 'vitest';

const mockTxClient = {
  article: {
    deleteMany: vi.fn(),
  },
  cluster: {
    deleteMany: vi.fn(),
  },
};

vi.mock('../../lib/prisma', () => ({
  default: {
    $transaction: vi.fn((callback) => callback(mockTxClient)),
    article: {
      deleteMany: vi.fn(),
    },
    cluster: {
      deleteMany: vi.fn(),
    },
  },
}));

describe('DatabaseRepository', () => {
  let repository: DatabaseRepository;

  beforeEach(() => {
    repository = new DatabaseRepository();
    vi.clearAllMocks();
  });

  describe('deleteExpiredArticles', () => {
    it('should call deleteMany with correct cutoff date on default client', async () => {
      vi.mocked(prisma.article.deleteMany).mockResolvedValue({ count: 5 });

      const cutoff = new Date('2026-07-04T00:00:00Z');
      const count = await repository.deleteExpiredArticles(cutoff);

      expect(prisma.article.deleteMany).toHaveBeenCalledWith({
        where: {
          publishedAt: {
            lt: cutoff,
          },
        },
      });
      expect(count).toBe(5);
    });

    it('should call deleteMany with correct cutoff date on provided transaction client', async () => {
      vi.mocked(mockTxClient.article.deleteMany).mockResolvedValue({ count: 5 });

      const cutoff = new Date('2026-07-04T00:00:00Z');
      const count = await repository.deleteExpiredArticles(cutoff, mockTxClient as any);

      expect(mockTxClient.article.deleteMany).toHaveBeenCalledWith({
        where: {
          publishedAt: {
            lt: cutoff,
          },
        },
      });
      expect(count).toBe(5);
    });
  });

  describe('deleteEmptyClusters', () => {
    it('should call deleteMany with correct relation filter on default client', async () => {
      vi.mocked(prisma.cluster.deleteMany).mockResolvedValue({ count: 2 });

      const count = await repository.deleteEmptyClusters();

      expect(prisma.cluster.deleteMany).toHaveBeenCalledWith({
        where: {
          articles: {
            none: {},
          },
        },
      });
      expect(count).toBe(2);
    });

    it('should call deleteMany with correct relation filter on provided transaction client', async () => {
      vi.mocked(mockTxClient.cluster.deleteMany).mockResolvedValue({ count: 2 });

      const count = await repository.deleteEmptyClusters(mockTxClient as any);

      expect(mockTxClient.cluster.deleteMany).toHaveBeenCalledWith({
        where: {
          articles: {
            none: {},
          },
        },
      });
      expect(count).toBe(2);
    });
  });

  describe('cleanupExpired', () => {
    it('should run both deletions in a transaction with the correct transaction client', async () => {
      vi.mocked(mockTxClient.article.deleteMany).mockResolvedValue({ count: 8 });
      vi.mocked(mockTxClient.cluster.deleteMany).mockResolvedValue({ count: 4 });

      const cutoff = new Date('2026-07-04T00:00:00Z');
      const result = await repository.cleanupExpired(cutoff);

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(mockTxClient.article.deleteMany).toHaveBeenCalledWith({
        where: {
          publishedAt: {
            lt: cutoff,
          },
        },
      });
      expect(mockTxClient.cluster.deleteMany).toHaveBeenCalledWith({
        where: {
          articles: {
            none: {},
          },
        },
      });

      expect(result).toEqual({
        deletedArticles: 8,
        deletedClusters: 4,
      });
    });
  });
});
