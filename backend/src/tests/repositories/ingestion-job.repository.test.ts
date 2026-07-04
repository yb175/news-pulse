import { IngestionJobRepository } from '../../repositories/ingestion-job.repository';
import prisma from '../../lib/prisma';
import { JobStatus } from '@prisma/client';
import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../../lib/prisma', () => ({
  default: {
    ingestionJob: {
      create: vi.fn(),
      update: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

describe('IngestionJobRepository', () => {
  let repository: IngestionJobRepository;

  beforeEach(() => {
    repository = new IngestionJobRepository();
    vi.clearAllMocks();
  });

  describe('createJob', () => {
    it('should call create with correct PENDING structure', async () => {
      const mockJob = { id: 'job-1', status: 'PENDING' };
      vi.mocked(prisma.ingestionJob.create).mockResolvedValue(mockJob as any);

      const result = await repository.createJob();

      expect(prisma.ingestionJob.create).toHaveBeenCalledWith({
        data: {
          status: JobStatus.PENDING,
          startedAt: expect.any(Date),
          articlesFound: 0,
        },
      });
      expect(result).toEqual(mockJob);
    });
  });

  describe('updateStatus', () => {
    it('should call update with COMPLETED and completion timestamp', async () => {
      const mockJob = { id: 'job-1', status: 'COMPLETED' };
      vi.mocked(prisma.ingestionJob.update).mockResolvedValue(mockJob as any);

      const result = await repository.updateStatus('job-1', JobStatus.COMPLETED, 5, 'Done');

      expect(prisma.ingestionJob.update).toHaveBeenCalledWith({
        where: { id: 'job-1' },
        data: {
          status: JobStatus.COMPLETED,
          articlesFound: 5,
          logs: 'Done',
          completedAt: expect.any(Date),
        },
      });
      expect(result).toEqual(mockJob);
    });
  });

  describe('findById', () => {
    it('should call findUnique with correct ID', async () => {
      const mockJob = { id: 'job-1', status: 'PENDING' };
      vi.mocked(prisma.ingestionJob.findUnique).mockResolvedValue(mockJob as any);

      const result = await repository.findById('job-1');

      expect(prisma.ingestionJob.findUnique).toHaveBeenCalledWith({
        where: { id: 'job-1' },
      });
      expect(result).toEqual(mockJob);
    });
  });
});
