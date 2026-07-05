import { Request, Response, NextFunction } from 'express';
import { IngestionService } from '../services/ingestion.service';
import { HttpError } from '../middleware/error.middleware';

export class IngestController {
  private service = new IngestionService();

  triggerIngestion = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const jobId = await this.service.triggerIngestion();
      return res.status(200).json({
        jobId,
        status: 'queued',
      });
    } catch (error) {
      next(error);
    }
  };

  getJobStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { jobId } = req.params;

      // Validate that jobId is a valid UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(jobId)) {
        return next(new HttpError(400, 'Invalid job ID format.'));
      }

      const job = await this.service.getJobStatus(jobId);
      if (!job) {
        return next(new HttpError(404, 'Job not found.'));
      }

      let statusStr = 'running';
      if (job.status === 'PENDING') {
        statusStr = 'queued';
      } else if (job.status === 'RUNNING') {
        statusStr = 'running';
      } else if (job.status === 'COMPLETED') {
        statusStr = 'completed';
      } else if (job.status === 'FAILED') {
        statusStr = 'failed';
      }

      if (statusStr === 'completed') {
        return res.status(200).json({
          jobId: job.id,
          status: statusStr,
          completedAt: job.completedAt ? job.completedAt.toISOString() : new Date().toISOString(),
        });
      }

      if (statusStr === 'failed') {
        return res.status(200).json({
          jobId: job.id,
          status: statusStr,
          error: job.logs || 'RSS fetch failed.',
        });
      }

      return res.status(200).json({
        jobId: job.id,
        status: statusStr,
      });
    } catch (error) {
      next(error);
    }
  };

  getLatestCompletedJob = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const job = await this.service.getLatestCompleted();
      return res.status(200).json({
        completedAt: job ? job.completedAt?.toISOString() || null : null,
      });
    } catch (error) {
      next(error);
    }
  };
}
