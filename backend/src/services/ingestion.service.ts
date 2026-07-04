import { PythonRunner } from '../jobs/python-runner';
import { IngestionJobRepository } from '../repositories/ingestion-job.repository';

export class IngestionService {
  private pythonRunner = new PythonRunner();
  private repository = new IngestionJobRepository();

  async triggerIngestion(): Promise<string> {
    const job = await this.repository.createJob();

    try {
      // Launch child process in background asynchronously (non-blocking)
      await this.pythonRunner.launch(job.id);
    } catch (error: any) {
      console.error(`[IngestionService] Ingestion trigger pipeline launch failure: ${error.message}`);
      await this.repository.updateStatus(job.id, 'FAILED', 0, `Launch Failure: ${error.message}`);
      throw error;
    }

    return job.id;
  }

  async getJobStatus(jobId: string) {
    return this.repository.findById(jobId);
  }
}
