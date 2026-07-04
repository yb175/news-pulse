import { IngestionService } from '../../services/ingestion.service';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('IngestionService', () => {
  let service: IngestionService;
  let mockCreateJob: any;
  let mockUpdateStatus: any;
  let mockLaunch: any;

  beforeEach(() => {
    service = new IngestionService();
    mockCreateJob = vi.fn();
    mockUpdateStatus = vi.fn();
    mockLaunch = vi.fn();

    (service as any).repository = {
      createJob: mockCreateJob,
      updateStatus: mockUpdateStatus,
    };
    (service as any).pythonRunner = {
      launch: mockLaunch,
    };
  });

  it('should create a job and call launch successfully', async () => {
    mockCreateJob.mockResolvedValue({ id: 'job-123', status: 'PENDING' });
    mockLaunch.mockResolvedValue(undefined);

    const result = await service.triggerIngestion();

    expect(result).toBe('job-123');
    expect(mockCreateJob).toHaveBeenCalled();
    expect(mockLaunch).toHaveBeenCalledWith('job-123');
  });

  it('should transition job to FAILED in DB and propagate error on launch failure', async () => {
    mockCreateJob.mockResolvedValue({ id: 'job-123', status: 'PENDING' });
    mockLaunch.mockRejectedValue(new Error('Spawn failed'));

    await expect(service.triggerIngestion()).rejects.toThrow('Spawn failed');

    expect(mockCreateJob).toHaveBeenCalled();
    expect(mockLaunch).toHaveBeenCalledWith('job-123');
    expect(mockUpdateStatus).toHaveBeenCalledWith('job-123', 'FAILED', 0, 'Launch Failure: Spawn failed');
  });

  describe('getJobStatus', () => {
    let mockFindById: any;

    beforeEach(() => {
      mockFindById = vi.fn();
      (service as any).repository.findById = mockFindById;
    });

    it('should delegate to repository and return job details', async () => {
      const mockJob = { id: 'job-123', status: 'COMPLETED', completedAt: new Date() };
      mockFindById.mockResolvedValue(mockJob);

      const result = await service.getJobStatus('job-123');

      expect(mockFindById).toHaveBeenCalledWith('job-123');
      expect(result).toEqual(mockJob);
    });
  });
});
