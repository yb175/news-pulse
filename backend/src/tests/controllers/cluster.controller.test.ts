import { Request, Response } from 'express';
import { ClusterController } from '../../controllers/cluster.controller';
import { HttpError } from '../../middleware/error.middleware';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('ClusterController', () => {
  let controller: ClusterController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let nextMock: any;
  let statusMock: any;
  let jsonMock: any;
  let getAllClustersMock: any;
  let getClusterDetailsMock: any;

  beforeEach(() => {
    controller = new ClusterController();
    getAllClustersMock = vi.fn();
    getClusterDetailsMock = vi.fn();
    (controller as any).service = {
      getAllClusters: getAllClustersMock,
      getClusterDetails: getClusterDetailsMock,
    };
    jsonMock = vi.fn();
    statusMock = vi.fn().mockReturnValue({ json: jsonMock });
    res = {
      status: statusMock,
    };
    nextMock = vi.fn();
  });

  describe('getClusters', () => {
    it('should return 200 and list of clusters', async () => {
      req = {};
      const mockClusters = [
        {
          id: 'c1',
          label: 'Cluster One',
          articleCount: 5,
          timeRange: { start: '2026-07-04T10:00:00Z', end: '2026-07-04T12:00:00Z' },
        },
      ];
      getAllClustersMock.mockResolvedValue(mockClusters);

      await controller.getClusters(req as Request, res as Response, nextMock);

      expect(getAllClustersMock).toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(mockClusters);
      expect(nextMock).not.toHaveBeenCalled();
    });

    it('should call next with error when getClusters service fails', async () => {
      req = {};
      const serviceError = new Error('Database down');
      getAllClustersMock.mockRejectedValue(serviceError);

      await controller.getClusters(req as Request, res as Response, nextMock);

      expect(nextMock).toHaveBeenCalledWith(serviceError);
    });
  });

  describe('getClusterDetails', () => {
    it('should call next with 400 HttpError when cluster ID is not a valid UUID format', async () => {
      req = { params: { id: 'invalid-id' } };

      await controller.getClusterDetails(req as Request, res as Response, nextMock);

      expect(nextMock).toHaveBeenCalledWith(expect.any(HttpError));
      expect(nextMock.mock.calls[0][0].status).toBe(400);
    });

    it('should call next with 404 HttpError when cluster is not found', async () => {
      const validUuid = '6454dbd2-5076-43c9-bd41-2e8fd765cdc2';
      req = { params: { id: validUuid } };
      getClusterDetailsMock.mockResolvedValue(null);

      await controller.getClusterDetails(req as Request, res as Response, nextMock);

      expect(getClusterDetailsMock).toHaveBeenCalledWith(validUuid);
      expect(nextMock).toHaveBeenCalledWith(expect.any(HttpError));
      expect(nextMock.mock.calls[0][0].status).toBe(404);
    });

    it('should return 200 and cluster details when cluster exists', async () => {
      const validUuid = '6454dbd2-5076-43c9-bd41-2e8fd765cdc2';
      req = { params: { id: validUuid } };
      const mockDetails = {
        id: validUuid,
        label: 'Cluster Details',
        articles: [],
      };
      getClusterDetailsMock.mockResolvedValue(mockDetails);

      await controller.getClusterDetails(req as Request, res as Response, nextMock);

      expect(getClusterDetailsMock).toHaveBeenCalledWith(validUuid);
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(mockDetails);
      expect(nextMock).not.toHaveBeenCalled();
    });

    it('should call next with error when getClusterDetails service fails', async () => {
      const validUuid = '6454dbd2-5076-43c9-bd41-2e8fd765cdc2';
      req = { params: { id: validUuid } };
      const serviceError = new Error('Details failed');
      getClusterDetailsMock.mockRejectedValue(serviceError);

      await controller.getClusterDetails(req as Request, res as Response, nextMock);

      expect(nextMock).toHaveBeenCalledWith(serviceError);
    });
  });
});
