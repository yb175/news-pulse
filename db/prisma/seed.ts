import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with mock articles and clusters...');

  // Clean old data
  await prisma.article.deleteMany({});
  await prisma.cluster.deleteMany({});
  await prisma.ingestionJob.deleteMany({});

  // Create Ingestion Jobs
  await prisma.ingestionJob.create({
    data: {
      status: 'COMPLETED',
      startedAt: new Date(Date.now() - 3600000),
      completedAt: new Date(Date.now() - 3300000),
      articlesFound: 6,
      logs: 'Completed successfully. 6 articles found.',
    },
  });

  // Create Clusters
  const cluster1 = await prisma.cluster.create({
    data: {
      title: 'Global Tech Giants Announce AI Safety Standard Alliance',
      summary: 'Several major technology corporations have formed an alliance to establish and promote safety standards in generative artificial intelligence developments.',
    },
  });

  const cluster2 = await prisma.cluster.create({
    data: {
      title: 'Global Renewable Energy Reaches New Milestones in 2026',
      summary: 'Reports indicate solar and wind output has exceeded projections across Europe and North America, setting new production records.',
    },
  });

  // Create Articles for Cluster 1
  await prisma.article.createMany({
    data: [
      {
        title: 'Tech Companies Unite on Generative AI Security Protocol',
        url: 'https://www.bbc.co.uk/news/technology-ai-alliance',
        source: 'BBC News',
        author: 'Jane Doe',
        body: 'A coalition of global tech leaders announced today a set of shared principles and testing frameworks for generative AI models, aiming to mitigate systemic risks and build trust.',
        bodySnippet: 'A coalition of global tech leaders announced today a set of shared principles...',
        publishedAt: new Date(Date.now() - 7200000),
        clusterId: cluster1.id,
      },
      {
        title: 'New Coalition Aims to Regulate Generative AI Deployment',
        url: 'https://theguardian.com/technology/ai-safety-standard',
        source: 'The Guardian',
        author: 'John Smith',
        body: 'In an unprecedented collaboration, industry giants have unveiled a joint security framework. The new initiative focuses on safety benchmarks, security stress tests, and open-source models validation.',
        bodySnippet: 'In an unprecedented collaboration, industry giants have unveiled a joint security...',
        publishedAt: new Date(Date.now() - 10800000),
        clusterId: cluster1.id,
      },
      {
        title: 'AI Safety standards: Tech Giants Agree on Common Framework',
        url: 'https://www.npr.org/sections/tech/ai-safety-alliance',
        source: 'NPR',
        author: 'Sarah Johnson',
        body: 'Technologists from major software companies have signed an agreement to peer-review frontier AI systems. The protocol demands safety checks before commercial deployment.',
        bodySnippet: 'Technologists from major software companies have signed an agreement...',
        publishedAt: new Date(Date.now() - 14400000),
        clusterId: cluster1.id,
      },
    ],
  });

  // Create Articles for Cluster 2
  await prisma.article.createMany({
    data: [
      {
        title: 'Solar Output Breaks New Records Across Europe',
        url: 'https://www.bbc.co.uk/news/science-solar-records',
        source: 'BBC News',
        author: 'David Attenborough',
        body: 'A sunny summer and increased photovoltaic installation capacity has pushed solar power production to an all-time high in multiple European countries, meeting up to 45% of peak demand.',
        bodySnippet: 'A sunny summer and increased photovoltaic installation capacity has pushed...',
        publishedAt: new Date(Date.now() - 18000000),
        clusterId: cluster2.id,
      },
      {
        title: 'Wind and Solar Surge: Green Grid Targets Achieved Ahead of Schedule',
        url: 'https://theguardian.com/environment/solar-surge-milestone',
        source: 'The Guardian',
        author: 'Emily Davis',
        body: 'Renewable energy deployment in North America has overtaken grid targets by two years. Analysts attribute this success to lowered solar cell manufacturing costs and updated battery backup systems.',
        bodySnippet: 'Renewable energy deployment in North America has overtaken grid targets...',
        publishedAt: new Date(Date.now() - 21600000),
        clusterId: cluster2.id,
      },
    ],
  });

  // Add an unclustered article
  await prisma.article.create({
    data: {
      title: 'Local Library hosts Summer Coding Bootcamp',
      url: 'https://www.npr.org/sections/education/coding-bootcamp',
      source: 'NPR',
      author: 'Michael Brown',
      body: 'A local library is offering free coding and robotics courses for children this summer. The initiative is sponsored by volunteers from local software development firms.',
      bodySnippet: 'A local library is offering free coding and robotics courses...',
      publishedAt: new Date(Date.now() - 28800000),
    },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
