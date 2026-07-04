import request from 'supertest';
import app from '../../app';
import prisma from '../../lib/prisma';
import { describe, it, expect, beforeEach, afterEach, afterAll } from 'vitest';

describe('Timeline API Integration', () => {
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

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('GET /api/timeline should return expected response with sorted clusters', async () => {
    // Seed test data
    const cluster1 = await prisma.cluster.create({
      data: {
        title: 'Cluster One',
        articles: {
          create: [
            {
              title: 'Article 1',
              url: 'http://example.com/1',
              source: 'BBC News',
              body: 'Body 1',
              bodySnippet: 'Snippet 1',
              publishedAt: new Date('2026-07-04T12:00:00Z'),
            },
          ],
        },
      },
    });

    const cluster2 = await prisma.cluster.create({
      data: {
        title: 'Cluster Two',
        articles: {
          create: [
            {
              title: 'Article 2',
              url: 'http://example.com/2',
              source: 'NPR',
              body: 'Body 2',
              bodySnippet: 'Snippet 2',
              publishedAt: new Date('2026-07-04T14:00:00Z'),
            },
          ],
        },
      },
    });

    const response = await request(app).get('/api/timeline');
    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBe(2);

    // Verify ordering: Cluster Two (14:00) should come first, then Cluster One (12:00)
    expect(response.body[0].clusterId).toBe(cluster2.id);
    expect(response.body[0].label).toBe('Cluster Two');
    expect(response.body[0].startTime).toBe(new Date('2026-07-04T14:00:00Z').toISOString());
    expect(response.body[0].endTime).toBe(new Date('2026-07-04T14:00:00Z').toISOString());
    expect(response.body[0].articleCount).toBe(1);

    expect(response.body[1].clusterId).toBe(cluster1.id);
    expect(response.body[1].label).toBe('Cluster One');
  });

  it('GET /api/timeline with sources should filter results', async () => {
    const cluster1 = await prisma.cluster.create({
      data: {
        title: 'Cluster One',
        articles: {
          create: [
            {
              title: 'Article 1',
              url: 'http://example.com/1',
              source: 'BBC News',
              body: 'Body 1',
              bodySnippet: 'Snippet 1',
              publishedAt: new Date('2026-07-04T12:00:00Z'),
            },
          ],
        },
      },
    });

    const cluster2 = await prisma.cluster.create({
      data: {
        title: 'Cluster Two',
        articles: {
          create: [
            {
              title: 'Article 2',
              url: 'http://example.com/2',
              source: 'NPR',
              body: 'Body 2',
              bodySnippet: 'Snippet 2',
              publishedAt: new Date('2026-07-04T14:00:00Z'),
            },
          ],
        },
      },
    });

    const response = await request(app).get('/api/timeline?sources=BBC');
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].clusterId).toBe(cluster1.id);
  });

  it('GET /api/timeline with invalid sources format (empty values) should filter them out and return 200', async () => {
    await prisma.cluster.create({
      data: {
        title: 'Cluster One',
        articles: {
          create: [
            {
              title: 'Article 1',
              url: 'http://example.com/1',
              source: 'BBC News',
              body: 'Body 1',
              bodySnippet: 'Snippet 1',
              publishedAt: new Date('2026-07-04T12:00:00Z'),
            },
          ],
        },
      },
    });

    const response = await request(app).get('/api/timeline?sources=BBC,,NPR');
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].label).toBe('Cluster One');
  });
});
