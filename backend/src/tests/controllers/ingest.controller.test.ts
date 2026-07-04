import { Request, Response } from 'express';
import { IngestController } from '../../controllers/ingest.controller';
import { HttpError } from '../../middleware/error.middleware';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('IngestController', () => {
  let controller: IngestController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let nextMock: any;
  let statusMock: any;
  let jsonMock: any;
  let mockTriggerIngestion: any;
  let mockGetJobStatus: any;

  beforeEach(() => {
    controller = new IngestController();
    mockTriggerIngestion = vi.fn();
    mockGetJobStatus = vi.fn();

    (controller as any).service = {
      triggerIngestion: mockTriggerIngestion,
      getJobStatus: mockGetJobStatus,
    };

    jsonMock = vi.fn();
    statusMock = vi.fn().mockReturnValue({ json: jsonMock });
    res = {
      status: statusMock,
    };
    nextMock = vi.fn();
  });

  describe('triggerIngestion', () => {
    it('should return 200 and queued status on successful trigger', async () => {
      req = {};
      mockTriggerIngestion.mockResolvedValue('job-123');

      await controller.triggerIngestion(req as Request, res as Response, nextMock);

      expect(mockTriggerIngestion).toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        jobId: 'job-123',
        status: 'queued',
      });
      expect(nextMock).not.toHaveBeenCalled();
    });

    it('should call next with error when triggerIngestion throws an error', async () => {
      req = {};
      const serviceError = new Error('Process launch failed');
      mockTriggerIngestion.mockRejectedValue(serviceError);

      await controller.triggerIngestion(req as Request, res as Response, nextMock);

      expect(nextMock).toHaveBeenCalledWith(serviceError);
    });
  });

  describe('getJobStatus', () => {
    it('should call next with 400 HttpError when jobId is not a valid UUID', async () => {
      req = { params: { jobId: 'invalid-uuid' } };

      await controller.getJobStatus(req as Request, res as Response, nextMock);

      expect(nextMock).toHaveBeenCalledWith(expect.any(HttpError));
      expect(nextMock.mock.calls[0][0].status).toBe(400);
    });

    it('should call next with 404 HttpError when job is not found', async () => {
      const validUuid = '6454dbd2-5076-43c9-bd41-2e8fd765cdc2';
      req = { params: { jobId: validUuid } };
      mockGetJobStatus.mockResolvedValue(null);

      await controller.getJobStatus(req as Request, res as Response, nextMock);

      expect(mockGetJobStatus).toHaveBeenCalledWith(validUuid);
      expect(nextMock).toHaveBeenCalledWith(expect.any(HttpError));
      expect(nextMock.mock.calls[0][0].status).toBe(404);
    });

    it('should return 200 with status queued when job status is PENDING', async () => {
      const validUuid = '6454dbd2-5076-43c9-bd41-2e8fd765cdc2';
      req = { params: { jobId: validUuid } };
      mockGetJobStatus.mockResolvedValue({ id: validUuid, status: 'PENDING' });

      await controller.getJobStatus(req as Request, res as Response, nextMock);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        jobId: validUuid,
        status: 'queued',
      });
      expect(nextMock).not.toHaveBeenCalled();
    });

    it('should return 200 with status running when job status is RUNNING', async () => {
      const validUuid = '6454dbd2-5076-43c9-bd41-2e8fd765cdc2';
      req = { params: { jobId: validUuid } };
      mockGetJobStatus.mockResolvedValue({ id: validUuid, status: 'RUNNING' });

      await controller.getJobStatus(req as Request, res as Response, nextMock);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        jobId: validUuid,
        status: 'running',
      });
      expect(nextMock).not.toHaveBeenCalled();
    });

    it('should return 200 with status completed and completedAt date', async () => {
      const validUuid = '6454dbd2-5076-43c9-bd41-2e8fd765cdc2';
      req = { params: { jobId: validUuid } };
      const completedDate = new Date();
      mockGetJobStatus.mockResolvedValue({
        id: validUuid,
        status: 'COMPLETED',
        completedAt: completedDate,
      });

      await controller.getJobStatus(req as Request, res as Response, nextMock);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        jobId: validUuid,
        status: 'completed',
        completedAt: completedDate.toISOString(),
      });
      expect(nextMock).not.toHaveBeenCalled();
    });

    it('should return 200 with status failed and error message', async () => {
      const validUuid = '6454dbd2-5076-43c9-bd41-2e8fd765cdc2';
      req = { params: { jobId: validUuid } };
      mockGetJobStatus.mockResolvedValue({
        id: validUuid,
        status: 'FAILED',
        logs: 'Scraper failed due to timeout',
      });

      await controller.getJobStatus(req as Request, res as Response, nextMock);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        jobId: validUuid,
        status: 'failed',
        error: 'Scraper failed due to timeout',
      });
      expect(nextMock).not.toHaveBeenCalled();
    });

    it('should call next with error when getJobStatus throws an error', async () => {
      const validUuid = '6454dbd2-5076-43c9-bd41-2e8fd765cdc2';
      req = { params: { jobId: validUuid } };
      const serviceError = new Error('Database connection failed');
      mockGetJobStatus.mockRejectedValue(serviceError);

      await controller.getJobStatus(req as Request, res as Response, nextMock);

      expect(nextMock).toHaveBeenCalledWith(serviceError);
    });
  });
});
