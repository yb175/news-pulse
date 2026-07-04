import request from 'supertest';
import app from '../../app';
import prisma from '../../lib/prisma';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('Cluster Listing API Integration', () => {
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

  it('GET /api/clusters should return empty array when DB is empty', async () => {
    const response = await request(app).get('/api/clusters');
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it('GET /api/clusters should return clusters with correct counts, timeRanges, and ordering', async () => {
    // Seed c1 (Older: start 10:00)
    const c1 = await prisma.cluster.create({
      data: {
        title: 'Older Event',
        articles: {
          create: [
            {
              title: 'A1',
              url: 'http://example.com/a1',
              source: 'BBC',
              body: 'body',
              bodySnippet: 'snip',
              publishedAt: new Date('2026-07-04T12:00:00Z'),
            },
            {
              title: 'A2',
              url: 'http://example.com/a2',
              source: 'Guardian',
              body: 'body',
              bodySnippet: 'snip',
              publishedAt: new Date('2026-07-04T10:00:00Z'),
            },
          ],
        },
      },
    });

    // Seed c2 (Empty)
    const c2 = await prisma.cluster.create({
      data: {
        title: 'Empty Event',
      },
    });

    // Seed c3 (Newer: start 14:00)
    const c3 = await prisma.cluster.create({
      data: {
        title: 'Newer Event',
        articles: {
          create: [
            {
              title: 'A3',
              url: 'http://example.com/a3',
              source: 'NPR',
              body: 'body',
              bodySnippet: 'snip',
              publishedAt: new Date('2026-07-04T14:00:00Z'),
            },
          ],
        },
      },
    });

    const response = await request(app).get('/api/clusters');
    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBe(3);

    // Verify ordering: c3 (Newer: 14:00), c1 (Older: 10:00), c2 (Empty: null)
    expect(response.body[0].id).toBe(c3.id);
    expect(response.body[0].label).toBe('Newer Event');
    expect(response.body[0].articleCount).toBe(1);
    expect(response.body[0].timeRange).toEqual({
      start: new Date('2026-07-04T14:00:00Z').toISOString(),
      end: new Date('2026-07-04T14:00:00Z').toISOString(),
    });

    expect(response.body[1].id).toBe(c1.id);
    expect(response.body[1].label).toBe('Older Event');
    expect(response.body[1].articleCount).toBe(2);
    expect(response.body[1].timeRange).toEqual({
      start: new Date('2026-07-04T10:00:00Z').toISOString(),
      end: new Date('2026-07-04T12:00:00Z').toISOString(),
    });

    expect(response.body[2].id).toBe(c2.id);
    expect(response.body[2].label).toBe('Empty Event');
    expect(response.body[2].articleCount).toBe(0);
    expect(response.body[2].timeRange).toBeNull();
  });
});
