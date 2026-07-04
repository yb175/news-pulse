import { PythonTrigger } from '../jobs/python-trigger';
import { IngestionRepository } from '../repositories/ingestion.repository';

// This service manages background scraper ingestion executions.
// In a real product implementation, it spawns python scraper child processes and polls databases.

export class IngestService {
  private pythonTrigger = new PythonTrigger();
  private repository = new IngestionRepository();

  async triggerIngestion(): Promise<string> {
    console.log("IngestService.triggerIngestion() stub called");
    return this.pythonTrigger.runJob();
  }

  async getJobStatus(jobId: string) {
    console.log(`IngestService.getJobStatus() stub called for Job ID: ${jobId}`);
    return this.repository.getJob(jobId);
  }
}