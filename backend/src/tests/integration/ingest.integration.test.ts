import request from 'supertest';
import app from '../../app';
import prisma from '../../lib/prisma';
import { describe, it, expect, beforeEach, afterEach, afterAll, vi } from 'vitest';

vi.mock('../../jobs/python-runner', () => {
  return {
    PythonRunner: class {
      launch = vi.fn().mockResolvedValue(undefined);
    },
  };
});

describe('Ingest Trigger API Integration', () => {
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

  it('POST /api/ingest/trigger should return 403 Forbidden to block client-side triggers', async () => {
    const response = await request(app).post('/api/ingest/trigger');
    expect(response.status).toBe(403);
    expect(response.body.error).toBe('Ingestion can only be triggered by the backend scheduler.');

    // Verify no jobs were inserted in the database
    const count = await prisma.ingestionJob.count();
    expect(count).toBe(0);
  });
});
