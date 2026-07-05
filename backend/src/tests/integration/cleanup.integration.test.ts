import prisma from '../../lib/prisma';
import { CleanupService } from '../../services/cleanup.service';
import { describe, it, expect, beforeEach, afterEach, afterAll } from 'vitest';

describe('Cleanup Integration', () => {
  const service = new CleanupService();

  beforeEach(async () => {
    await prisma.article.deleteMany({});
    await prisma.cluster.deleteMany({});
  });

  afterEach(async () => {
    await prisma.article.deleteMany({});
    await prisma.cluster.deleteMany({});
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should delete expired articles and empty clusters, keeping recent articles and their clusters', async () => {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;

    // 1. Create a cluster with recent articles (should remain)
    const clusterActive = await prisma.cluster.create({
      data: {
        title: 'Active Tech News',
        articles: {
          create: [
            {
              title: 'New JS Framework Released',
              url: 'https://tech.example.com/js-new',
              source: 'TechCrunch',
              body: 'A new framework has been announced today.',
              bodySnippet: 'A new framework has been announced...',
              publishedAt: new Date(now - 2 * oneHour), // 2 hours old (recent)
            },
          ],
        },
      },
    });

    // 2. Create a cluster with a mix of active and expired articles
    const clusterMixed = await prisma.cluster.create({
      data: {
        title: 'Mixed News',
        articles: {
          create: [
            {
              title: 'Active Article in Mixed',
              url: 'https://example.com/mixed-active',
              source: 'NPR',
              body: 'Active body',
              bodySnippet: 'Active snippet',
              publishedAt: new Date(now - 5 * oneHour), // 5 hours old (recent)
            },
            {
              title: 'Expired Article in Mixed',
              url: 'https://example.com/mixed-expired',
              source: 'NPR',
              body: 'Expired body',
              bodySnippet: 'Expired snippet',
              publishedAt: new Date(now - 30 * oneHour), // 30 hours old (expired)
            },
          ],
        },
      },
    });

    // 3. Create a cluster with only expired articles
    const clusterExpired = await prisma.cluster.create({
      data: {
        title: 'Expired Tech News',
        articles: {
          create: [
            {
              title: 'Old iPhone Leak',
              url: 'https://tech.example.com/iphone-old',
              source: 'Wired',
              body: 'Leaks from 2 days ago.',
              bodySnippet: 'Leaks from 2 days ago...',
              publishedAt: new Date(now - 48 * oneHour), // 48 hours old (expired)
            },
          ],
        },
      },
    });

    // 4. Create an empty cluster (should be deleted)
    const clusterEmpty = await prisma.cluster.create({
      data: {
        title: 'Empty Cluster',
      },
    });

    // Run cleanup for 24-hour retention
    const result = await service.cleanupExpiredData(24);

    // Verify statistics
    expect(result.deletedArticles).toBe(2); // Expired Article in Mixed + Old iPhone Leak
    expect(result.deletedClusters).toBe(2);  // Expired Tech News (which became empty) + Empty Cluster

    // Verify remaining articles
    const remainingArticles = await prisma.article.findMany({
      orderBy: { title: 'asc' },
    });
    expect(remainingArticles.length).toBe(2);
    expect(remainingArticles[0].title).toBe('Active Article in Mixed');
    expect(remainingArticles[1].title).toBe('New JS Framework Released');

    // Verify remaining clusters
    const remainingClusters = await prisma.cluster.findMany({
      orderBy: { title: 'asc' },
    });
    expect(remainingClusters.length).toBe(2);
    expect(remainingClusters[0].title).toBe('Active Tech News');
    expect(remainingClusters[1].title).toBe('Mixed News');
  });

  it('should be idempotent and handle empty database gracefully', async () => {
    const result = await service.cleanupExpiredData(24);
    expect(result).toEqual({
      deletedArticles: 0,
      deletedClusters: 0,
    });
  });
});
