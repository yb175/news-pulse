import { Request, Response } from 'express';
import { TimelineController } from '../../controllers/timeline.controller';
import { HttpError } from '../../middleware/error.middleware';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('TimelineController', () => {
  let controller: TimelineController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let nextMock: any;
  let statusMock: any;
  let jsonMock: any;
  let getTimelineMock: any;

  beforeEach(() => {
    controller = new TimelineController();
    getTimelineMock = vi.fn();
    (controller as any).service = {
      getTimeline: getTimelineMock,
    };
    jsonMock = vi.fn();
    statusMock = vi.fn().mockReturnValue({ json: jsonMock });
    res = {
      status: statusMock,
    };
    nextMock = vi.fn();
  });

  it('should return 200 and timeline data on valid request without sources', async () => {
    req = { query: {} };
    const mockTimeline = [
      { clusterId: 'c1', label: 'Tech Giants AI', startTime: '2026-07-04T00:00:00Z', endTime: '2026-07-04T02:00:00Z', articleCount: 3 }
    ];
    getTimelineMock.mockResolvedValue(mockTimeline);

    await controller.getTimeline(req as Request, res as Response, nextMock);

    expect(getTimelineMock).toHaveBeenCalledWith(7, undefined);
    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith(mockTimeline);
    expect(nextMock).not.toHaveBeenCalled();
  });

  it('should return 200 and timeline data on valid request with sources', async () => {
    req = { query: { sources: 'BBC,NPR' } };
    const mockTimeline = [
      { clusterId: 'c1', label: 'Tech Giants AI', startTime: '2026-07-04T00:00:00Z', endTime: '2026-07-04T02:00:00Z', articleCount: 3 }
    ];
    getTimelineMock.mockResolvedValue(mockTimeline);

    await controller.getTimeline(req as Request, res as Response, nextMock);

    expect(getTimelineMock).toHaveBeenCalledWith(7, ['BBC', 'NPR']);
    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith(mockTimeline);
    expect(nextMock).not.toHaveBeenCalled();
  });

  it('should ignore empty sources parameter and return 200 with unfiltered data', async () => {
    req = { query: { sources: '' } };
    const mockTimeline = [
      { clusterId: 'c1', label: 'Tech Giants AI', startTime: '2026-07-04T00:00:00Z', endTime: '2026-07-04T02:00:00Z', articleCount: 3 }
    ];
    getTimelineMock.mockResolvedValue(mockTimeline);

    await controller.getTimeline(req as Request, res as Response, nextMock);

    expect(getTimelineMock).toHaveBeenCalledWith(7, undefined);
    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith(mockTimeline);
    expect(nextMock).not.toHaveBeenCalled();
  });

  it('should filter out empty values in sources parameter and return 200', async () => {
    req = { query: { sources: 'BBC,,NPR' } };
    const mockTimeline = [
      { clusterId: 'c1', label: 'Tech Giants AI', startTime: '2026-07-04T00:00:00Z', endTime: '2026-07-04T02:00:00Z', articleCount: 3 }
    ];
    getTimelineMock.mockResolvedValue(mockTimeline);

    await controller.getTimeline(req as Request, res as Response, nextMock);

    expect(getTimelineMock).toHaveBeenCalledWith(7, ['BBC', 'NPR']);
    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith(mockTimeline);
    expect(nextMock).not.toHaveBeenCalled();
  });

  it('should call next with 400 HttpError when days parameter is negative or non-numeric', async () => {
    req = { query: { days: '-10' } };
    await controller.getTimeline(req as Request, res as Response, nextMock);
    expect(nextMock).toHaveBeenCalledWith(expect.any(HttpError));
    expect(nextMock.mock.calls[0][0].status).toBe(400);

    nextMock.mockClear();

    req = { query: { days: 'abc' } };
    await controller.getTimeline(req as Request, res as Response, nextMock);
    expect(nextMock).toHaveBeenCalledWith(expect.any(HttpError));
    expect(nextMock.mock.calls[0][0].status).toBe(400);
  });

  it('should return 200 with empty array when timeline is empty', async () => {
    req = { query: {} };
    getTimelineMock.mockResolvedValue([]);

    await controller.getTimeline(req as Request, res as Response, nextMock);

    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith([]);
    expect(nextMock).not.toHaveBeenCalled();
  });

  it('should call next with 500 error when service fails', async () => {
    req = { query: {} };
    const serviceError = new Error('Service error');
    getTimelineMock.mockRejectedValue(serviceError);

    await controller.getTimeline(req as Request, res as Response, nextMock);

    expect(nextMock).toHaveBeenCalledWith(serviceError);
  });
});
