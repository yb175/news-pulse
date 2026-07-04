import request from 'supertest';
import app from '../../app';
import prisma from '../../lib/prisma';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('Cluster Details API Integration', () => {
  beforeEach(async () => {
    // Clean DB
    await prisma.article.deleteMany({});
    await prisma.cluster.deleteMany({});
  });

  afterEach(async () => {
    // Clean DB
    await prisma.article.deleteMany({});
    await prisma.cluster.deleteMany({});
  });

  it('GET /api/clusters/:id with invalid UUID format should return 400', async () => {
    const response = await request(app).get('/api/clusters/invalid-uuid');
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Invalid cluster ID format.');
  });

  it('GET /api/clusters/:id with valid UUID but non-existent cluster should return 404', async () => {
    const validNonExistentUuid = '6454dbd2-5076-43c9-bd41-2e8fd765cdc2';
    const response = await request(app).get(`/api/clusters/${validNonExistentUuid}`);
    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Cluster not found.');
  });

  it('GET /api/clusters/:id should return 200 and cluster details with sorted articles', async () => {
    // Seed cluster with articles having different publishedAt dates
    const cluster = await prisma.cluster.create({
      data: {
        title: 'Tech Giants AI safety',
        articles: {
          create: [
            {
              title: 'A1',
              url: 'http://example.com/a1',
              source: 'BBC News',
              body: 'body',
              bodySnippet: 'Snippet 1',
              publishedAt: new Date('2026-07-04T12:00:00Z'),
            },
            {
              title: 'A2',
              url: 'http://example.com/a2',
              source: 'NPR',
              body: 'body',
              bodySnippet: 'Snippet 2',
              publishedAt: new Date('2026-07-04T14:00:00Z'),
            },
          ],
        },
      },
    });

    const response = await request(app).get(`/api/clusters/${cluster.id}`);
    expect(response.status).toBe(200);
    expect(response.body.id).toBe(cluster.id);
    expect(response.body.label).toBe('Tech Giants AI safety');
    expect(response.body.articles.length).toBe(2);

    // Verify mapping and ordering (A2 at 14:00 should come before A1 at 12:00)
    expect(response.body.articles[0].title).toBe('A2');
    expect(response.body.articles[0].summary).toBe('Snippet 2'); // mapped
    expect(response.body.articles[0].publishedAt).toBe(new Date('2026-07-04T14:00:00Z').toISOString());

    expect(response.body.articles[1].title).toBe('A1');
    expect(response.body.articles[1].summary).toBe('Snippet 1');
    expect(response.body.articles[1].publishedAt).toBe(new Date('2026-07-04T12:00:00Z').toISOString());
  });
});
