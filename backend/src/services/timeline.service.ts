import { ClusterRepository } from '../repositories/cluster.repository';

// This service manages timeline queries.
// In a real product implementation, it queries the database through repositories.

export class TimelineService {
  private clusterRepository = new ClusterRepository();

  async getTimeline(days: number = 7, sources?: string[]) {
    console.log(`TimelineService.getTimeline() stub called. Days: ${days}, Sources: ${sources}`);

    const mockTimeline = [
      {
        clusterId: "c1",
        label: "Apple WWDC Keynote and AI Features",
        startTime: new Date(Date.now() - 3600000 * 5).toISOString(),
        endTime: new Date(Date.now() - 3600000 * 1).toISOString(),
        articleCount: 3
      },
      {
        clusterId: "c2",
        label: "Global Green Energy Production Records",
        startTime: new Date(Date.now() - 3600000 * 8).toISOString(),
        endTime: new Date(Date.now() - 3600000 * 4).toISOString(),
        articleCount: 2
      }
    ];

    return mockTimeline;
  }
}