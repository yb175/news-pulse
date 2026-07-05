import request from 'supertest';
import app from '../../app';
import prisma from '../../lib/prisma';
import { describe, it, expect, beforeEach, afterEach, afterAll } from 'vitest';

describe('Ingest Status API Integration', () => {
  beforeEach(async () => {
    // Clean DB
    await prisma.ingestionJob.deleteMany({});
  });

  afterEach(async () => {
    // Clean DB
    await prisma.ingestionJob.deleteMany({});
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('GET /api/ingest/status/:jobId with invalid UUID should return 400', async () => {
    const response = await request(app).get('/api/ingest/status/invalid-uuid');
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Invalid job ID format.');
  });

  it('GET /api/ingest/status/:jobId with non-existent job should return 404', async () => {
    const validNonExistentUuid = '6454dbd2-5076-43c9-bd41-2e8fd765cdc2';
    const response = await request(app).get(`/api/ingest/status/${validNonExistentUuid}`);
    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Job not found.');
  });

  it('GET /api/ingest/status/:jobId should return correct DTO details for queued (PENDING) job', async () => {
    const job = await prisma.ingestionJob.create({
      data: {
        status: 'PENDING',
        startedAt: new Date(),
        articlesFound: 0,
      },
    });

    const response = await request(app).get(`/api/ingest/status/${job.id}`);
    expect(response.status).toBe(200);
    expect(response.body.jobId).toBe(job.id);
    expect(response.body.status).toBe('queued');
  });

  it('GET /api/ingest/status/:jobId should return running for RUNNING job', async () => {
    const job = await prisma.ingestionJob.create({
      data: {
        status: 'RUNNING',
        startedAt: new Date(),
        articlesFound: 0,
      },
    });

    const response = await request(app).get(`/api/ingest/status/${job.id}`);
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('running');
  });

  it('GET /api/ingest/status/:jobId should return completed and completedAt for COMPLETED job', async () => {
    const completedDate = new Date();
    const job = await prisma.ingestionJob.create({
      data: {
        status: 'COMPLETED',
        startedAt: new Date(Date.now() - 60000),
        completedAt: completedDate,
        articlesFound: 10,
        logs: 'Scraped 10 articles',
      },
    });

    const response = await request(app).get(`/api/ingest/status/${job.id}`);
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('completed');
    expect(response.body.completedAt).toBe(completedDate.toISOString());
  });

  it('GET /api/ingest/status/:jobId should return failed and error logs for FAILED job', async () => {
    const completedDate = new Date();
    const job = await prisma.ingestionJob.create({
      data: {
        status: 'FAILED',
        startedAt: new Date(Date.now() - 60000),
        completedAt: completedDate,
        articlesFound: 0,
        logs: 'Scraper failed to connect to database',
      },
    });

    const response = await request(app).get(`/api/ingest/status/${job.id}`);
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('failed');
    expect(response.body.error).toBe('Scraper failed to connect to database');
  });

  describe('GET /api/ingest/latest', () => {
    it('should return null when no completed ingestion jobs exist', async () => {
      const response = await request(app).get('/api/ingest/latest');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ completedAt: null });
    });

    it('should return the completedAt of the latest completed ingestion job', async () => {
      // 1. Create an older completed job
      await prisma.ingestionJob.create({
        data: {
          status: 'COMPLETED',
          startedAt: new Date(Date.now() - 3600000),
          completedAt: new Date(Date.now() - 3500000),
          articlesFound: 5,
        },
      });

      // 2. Create the latest completed job
      const latestCompletedTime = new Date(Date.now() - 60000);
      const latestJob = await prisma.ingestionJob.create({
        data: {
          status: 'COMPLETED',
          startedAt: new Date(Date.now() - 120000),
          completedAt: latestCompletedTime,
          articlesFound: 10,
        },
      });

      // 3. Create a running job (which has status RUNNING and should be ignored)
      await prisma.ingestionJob.create({
        data: {
          status: 'RUNNING',
          startedAt: new Date(),
          articlesFound: 0,
        },
      });

      // 4. Create a failed job (which has status FAILED and should be ignored)
      await prisma.ingestionJob.create({
        data: {
          status: 'FAILED',
          startedAt: new Date(),
          completedAt: new Date(),
          articlesFound: 0,
        },
      });

      const response = await request(app).get('/api/ingest/latest');
      expect(response.status).toBe(200);
      expect(response.body.completedAt).toBe(latestCompletedTime.toISOString());
    });
  });
});
