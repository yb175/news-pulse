import { ArticleRepository } from '../../repositories/article.repository';
import prisma from '../../lib/prisma';
import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../../lib/prisma', () => ({
  default: {
    article: {
      findMany: vi.fn(),
    },
  },
}));

describe('ArticleRepository', () => {
  let repository: ArticleRepository;

  beforeEach(() => {
    repository = new ArticleRepository();
    vi.clearAllMocks();
  });

  describe('findByCluster', () => {
    it('should call findMany with correct clusterId filter', async () => {
      const mockArticles = [{ id: 'a1', title: 'Article' }];
      vi.mocked(prisma.article.findMany).mockResolvedValue(mockArticles as any);

      const result = await repository.findByCluster('c1');

      expect(prisma.article.findMany).toHaveBeenCalledWith({
        where: { clusterId: 'c1' },
      });
      expect(result).toEqual(mockArticles);
    });
  });
});
