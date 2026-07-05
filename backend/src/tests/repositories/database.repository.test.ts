import { DatabaseRepository } from '../../repositories/database.repository';
import prisma from '../../lib/prisma';
import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../../lib/prisma', () => ({
  default: {
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
    it('should call deleteMany with correct cutoff date', async () => {
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
  });

  describe('deleteEmptyClusters', () => {
    it('should call deleteMany with correct relation filter', async () => {
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
  });
});
