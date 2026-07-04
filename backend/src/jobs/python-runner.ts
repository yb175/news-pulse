import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { IngestionJobRepository } from '../repositories/ingestion-job.repository';
import { SseService } from '../services/sse.service';

export class PythonRunner {
  private repository = new IngestionJobRepository();

  async launch(jobId: string): Promise<void> {
    const scraperDir = path.resolve(__dirname, '../../../scraper');
    const pythonPath = process.env.SCRAPER_PYTHON_PATH || 'python3';

    // Verify scraper directory exists
    if (!fs.existsSync(scraperDir)) {
      throw new Error(`Scraper directory does not exist: ${scraperDir}`);
    }

    // Spawn the child process
    let child;
    try {
      child = spawn(pythonPath, ['main.py'], {
        cwd: scraperDir,
        env: { ...process.env },
      });
    } catch (err: any) {
      throw new Error(`Failed to spawn Python process: ${err.message}`);
    }

    // Transition job status to RUNNING in database
    await this.repository.updateStatus(jobId, 'RUNNING', 0);

    let logs = '';

    child.stdout?.on('data', (data) => {
      logs += data.toString();
    });

    child.stderr?.on('data', (data) => {
      logs += data.toString();
    });

    child.on('error', async (error: any) => {
      try {
        console.error(`[PythonRunner] Job process error:`, error);
        logs += `\nError: ${error.message}`;
        await this.repository.updateStatus(jobId, 'FAILED', 0, logs);
      } catch (err) {
        console.error('[PythonRunner] Failed to update job status on process error:', err);
      }
    });

    child.on('close', async (code) => {
      try {
        console.log(`[PythonRunner] Job process closed with code ${code}`);
        if (code === 0) {
          // Parse stats or default to count
          let count = 0;
          const match = logs.match(/'articlesFound':\s*(\d+)/) || 
                        logs.match(/articlesFound:\s*(\d+)/) ||
                        logs.match(/'articles_count':\s*(\d+)/) ||
                        logs.match(/"articles_count":\s*(\d+)/) ||
                        logs.match(/'articles_persisted':\s*(\d+)/) ||
                        logs.match(/"articles_persisted":\s*(\d+)/) ||
                        logs.match(/'articles_fetched':\s*(\d+)/);
          if (match) {
            count = parseInt(match[1], 10);
          } else {
            console.warn('[PythonRunner] Output format mismatch; could not parse article count. Defaulting to 0.');
            count = 0;
          }
          await this.repository.updateStatus(jobId, 'COMPLETED', count, logs);
          SseService.broadcast('news-updated', { count, jobId });
        } else {
          await this.repository.updateStatus(jobId, 'FAILED', 0, logs);
        }
      } catch (err) {
        console.error('[PythonRunner] Failed to update job status on process close:', err);
      }
    });
  }
}
