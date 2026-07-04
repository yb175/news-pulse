import { Request, Response } from 'express';
import { IngestService } from '../services/ingest.service';

export class IngestController {
  private service = new IngestService();

  triggerIngestion = async (req: Request, res: Response) => {
    try {
      const jobId = await this.service.triggerIngestion();
      return res.status(200).json({
        jobId,
        status: 'queued'
      });
    } catch (error) {
      console.error('Error starting ingestion:', error);
      return res.status(500).json({ error: 'Internal Server Error.' });
    }
  };

  getJobStatus = async (req: Request, res: Response) => {
    try {
      const { jobId } = req.params;
      const job = await this.service.getJobStatus(jobId);
      if (!job) {
        return res.status(404).json({ error: 'Job not found.' });
      }

      let statusStr = 'running';
      if (job.status === 'COMPLETED') {
        statusStr = 'completed';
      } else if (job.status === 'FAILED') {
        statusStr = 'failed';
      }

      if (statusStr === 'completed') {
        return res.status(200).json({
          jobId: job.id,
          status: statusStr,
          completedAt: job.completedAt ? job.completedAt.toISOString() : new Date().toISOString()
        });
      }

      if (statusStr === 'failed') {
        return res.status(200).json({
          jobId: job.id,
          status: statusStr,
          error: job.logs || 'RSS fetch failed.'
        });
      }

      return res.status(200).json({
        jobId: job.id,
        status: statusStr
      });
    } catch (error) {
      console.error('Error getting job status:', error);
      return res.status(500).json({ error: 'Internal Server Error.' });
    }
  };
}
