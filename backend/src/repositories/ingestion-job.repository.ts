import { JobStatus } from '@prisma/client';
import prisma from '../lib/prisma';

export class IngestionJobRepository {
  async createJob(): Promise<any> {
    return prisma.ingestionJob.create({
      data: {
        status: JobStatus.PENDING,
        startedAt: new Date(),
        articlesFound: 0,
      },
    });
  }

  async updateStatus(id: string, status: JobStatus, articlesFound: number, logs?: string): Promise<any> {
    const data: any = {
      status,
      articlesFound,
    };
    if (logs !== undefined) {
      data.logs = logs;
    }
    if (status === JobStatus.COMPLETED || status === JobStatus.FAILED) {
      data.completedAt = new Date();
    }

    return prisma.ingestionJob.update({
      where: { id },
      data,
    });
  }

  async findById(id: string): Promise<any | null> {
    return prisma.ingestionJob.findUnique({
      where: { id },
    });
  }
}
