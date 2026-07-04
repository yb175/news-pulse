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

describe('Express Routing Integration', () => {
  beforeEach(async () => {
    // Clear databases
    await prisma.article.deleteMany({});
    await prisma.cluster.deleteMany({});
    await prisma.ingestionJob.deleteMany({});
  });

  afterEach(async () => {
    await prisma.article.deleteMany({});
    await prisma.cluster.deleteMany({});
    await prisma.ingestionJob.deleteMany({});
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Route Registration (Success Responses)', () => {
    it('GET /api/timeline should respond and default to empty timeline (200)', async () => {
      const response = await request(app).get('/api/timeline');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('GET /api/clusters should respond and default to empty array (200)', async () => {
      const response = await request(app).get('/api/clusters');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('POST /api/ingest/trigger should return 403 Forbidden to block client-side triggers', async () => {
      const response = await request(app).post('/api/ingest/trigger');
      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Ingestion can only be triggered by the backend scheduler.');
    });
  });

  describe('404 Fallback (Unknown Routes)', () => {
    it('GET /api/unknown-endpoint should return 404 Endpoint Not Found', async () => {
      const response = await request(app).get('/api/unknown-endpoint');
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Endpoint Not Found' });
    });

    it('POST /api/nonexistent-route should return 404 Endpoint Not Found', async () => {
      const response = await request(app).post('/api/nonexistent-route');
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Endpoint Not Found' });
    });
  });

  describe('405 Method Not Allowed', () => {
    it('POST /api/timeline should return 405 Method Not Allowed', async () => {
      const response = await request(app).post('/api/timeline');
      expect(response.status).toBe(405);
      expect(response.body).toEqual({ error: 'Method Not Allowed' });
    });

    it('POST /api/clusters should return 405 Method Not Allowed', async () => {
      const response = await request(app).post('/api/clusters');
      expect(response.status).toBe(405);
      expect(response.body).toEqual({ error: 'Method Not Allowed' });
    });

    it('POST /api/clusters/6454dbd2-5076-43c9-bd41-2e8fd765cdc2 should return 405 Method Not Allowed', async () => {
      const response = await request(app).post('/api/clusters/6454dbd2-5076-43c9-bd41-2e8fd765cdc2');
      expect(response.status).toBe(405);
      expect(response.body).toEqual({ error: 'Method Not Allowed' });
    });

    it('GET /api/ingest/trigger should return 405 Method Not Allowed', async () => {
      const response = await request(app).get('/api/ingest/trigger');
      expect(response.status).toBe(405);
      expect(response.body).toEqual({ error: 'Method Not Allowed' });
    });

    it('POST /api/ingest/status/6454dbd2-5076-43c9-bd41-2e8fd765cdc2 should return 405 Method Not Allowed', async () => {
      const response = await request(app).post('/api/ingest/status/6454dbd2-5076-43c9-bd41-2e8fd765cdc2');
      expect(response.status).toBe(405);
      expect(response.body).toEqual({ error: 'Method Not Allowed' });
    });
  });
});
