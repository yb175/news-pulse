import { CleanupService } from '../../services/cleanup.service';
import { DatabaseRepository } from '../../repositories/database.repository';
import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../../repositories/database.repository', () => {
  return {
    DatabaseRepository: vi.fn().mockImplementation(() => {
      return {
        cleanupExpired: vi.fn().mockResolvedValue({
          deletedArticles: 10,
          deletedClusters: 3,
        }),
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

  it('should call repository.cleanupExpired with calculated cutoff and return stats', async () => {
    const hours = 24;
    const result = await service.cleanupExpiredData(hours);

    expect(mockRepository.cleanupExpired).toHaveBeenCalled();

    const cutoffArg = mockRepository.cleanupExpired.mock.calls[0][0];
    const expectedCutoff = Date.now() - hours * 60 * 60 * 1000;
    // Allow minor time drift of 500ms
    expect(Math.abs(cutoffArg.getTime() - expectedCutoff)).toBeLessThan(500);

    expect(result).toEqual({
      deletedArticles: 10,
      deletedClusters: 3,
    });
  });

  it('should throw an error if retentionHours is invalid', async () => {
    await expect(service.cleanupExpiredData(0)).rejects.toThrow('Invalid retentionHours');
    await expect(service.cleanupExpiredData(-5)).rejects.toThrow('Invalid retentionHours');
    await expect(service.cleanupExpiredData(NaN)).rejects.toThrow('Invalid retentionHours');
    expect(mockRepository.cleanupExpired).not.toHaveBeenCalled();
  });
});
