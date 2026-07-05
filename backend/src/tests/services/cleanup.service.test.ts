import { CleanupService } from '../../services/cleanup.service';
import { DatabaseRepository } from '../../repositories/database.repository';
import prisma from '../../lib/prisma';
import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../../lib/prisma', () => ({
  default: {
    $transaction: vi.fn((callback) => callback(prisma)),
    article: {
      deleteMany: vi.fn(),
    },
    cluster: {
      deleteMany: vi.fn(),
    },
  },
}));

vi.mock('../../repositories/database.repository', () => {
  return {
    DatabaseRepository: vi.fn().mockImplementation(() => {
      return {
        deleteExpiredArticles: vi.fn().mockResolvedValue(10),
        deleteEmptyClusters: vi.fn().mockResolvedValue(3),
      };
    }),
  };
});

describe('CleanupService', () => {
  let service: CleanupService;
  let mockRepository: any;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new CleanupService();
    mockRepository = (service as any).repository;
  });

  it('should run deletions in a transaction and return the statistics', async () => {
    const hours = 24;
    const result = await service.cleanupExpiredData(hours);

    expect(prisma.$transaction).toHaveBeenCalled();
    expect(mockRepository.deleteExpiredArticles).toHaveBeenCalled();
    expect(mockRepository.deleteEmptyClusters).toHaveBeenCalled();

    const cutoffArg = mockRepository.deleteExpiredArticles.mock.calls[0][0];
    const expectedCutoff = Date.now() - hours * 60 * 60 * 1000;
    expect(Math.abs(cutoffArg.getTime() - expectedCutoff)).toBeLessThan(500);

    expect(result).toEqual({
      deletedArticles: 10,
      deletedClusters: 3,
    });
  });
});
