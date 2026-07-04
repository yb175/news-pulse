import { IngestionRepository } from '../repositories/ingestion.repository';

// This job handles executing the external Python ingestion pipeline.
// In a real product implementation, it spawns a child process to run main.py and hooks outputs:
//
// const child = spawn('python3', ['main.py'], {
//   cwd: path.resolve(__dirname, '../../../../scraper'),
//   env: { ...process.env }
// });
//
// And updates database records based on process exit codes.

export class PythonTrigger {
  private repository = new IngestionRepository();

  async runJob(): Promise<string> {
    const job = await this.repository.createJob();
    console.log(`[PythonTrigger] Triggered mock pipeline for job ${job.id}`);

    // Simulate async background completion for testing without real script spawning
    setTimeout(async () => {
      console.log(`[PythonTrigger] Mock execution finished for job ${job.id}`);
      await this.repository.updateJob(job.id, 'COMPLETED', 5, 'Mock logs: scraped 5 articles successfully.');
    }, 3000);

    return job.id;
  }
}
