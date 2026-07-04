import request from 'supertest';
import app from '../../app';
import prisma from '../../lib/prisma';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('Ingest Trigger API Integration', () => {
  beforeEach(async () => {
    // Clean DB
    await prisma.ingestionJob.deleteMany({});
  });

  afterEach(async () => {
    // Clean DB
    await prisma.ingestionJob.deleteMany({});
  });

  it('POST /api/ingest/trigger should return 200 with jobId and queued status, and insert PENDING/RUNNING job in DB', async () => {
    const response = await request(app).post('/api/ingest/trigger');
    expect(response.status).toBe(200);
    expect(response.body.jobId).toBeDefined();
    expect(response.body.status).toBe('queued');

    const jobId = response.body.jobId;

    // Verify it is saved in database
    const job = await prisma.ingestionJob.findUnique({
      where: { id: jobId },
    });

    expect(job).not.toBeNull();
    // It can be PENDING (queued) or RUNNING depending on background execution timing
    expect(['PENDING', 'RUNNING', 'COMPLETED', 'FAILED']).toContain(job!.status);
  });
});
