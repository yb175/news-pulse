// This service manages logic for querying news clusters.
// In a real product implementation, it queries clusters and groups from repositories.
// For this scaffolding template, it returns mock cluster data for UI demo.

export class ClusterService {
  async getAllClusters() {
    console.log("ClusterService.getAllClusters() stub called");
    return [
      {
        id: "c1",
        label: "Apple WWDC Keynote and AI Features",
        articleCount: 2,
        timeRange: {
          start: new Date(Date.now() - 3600000 * 5).toISOString(),
          end: new Date(Date.now() - 3600000 * 1).toISOString()
        }
      },
      {
        id: "c2",
        label: "Global Green Energy Production Records",
        articleCount: 2,
        timeRange: {
          start: new Date(Date.now() - 3600000 * 8).toISOString(),
          end: new Date(Date.now() - 3600000 * 4).toISOString()
        }
      }
    ];
  }

  async getClusterDetails(id: string) {
    console.log(`ClusterService.getClusterDetails() stub called for ID: ${id}`);
    
    if (id === "c1") {
      return {
        id: "c1",
        label: "Apple WWDC Keynote and AI Features",
        articles: [
          {
            id: "a1",
            title: "Apple unveils new AI features at WWDC",
            summary: "Apple announced a major integration of artificial intelligence tools across iOS and macOS at its developer conference.",
            source: "BBC News",
            url: "https://example.com/apple-ai",
            publishedAt: new Date(Date.now() - 3600000 * 4).toISOString()
          },
          {
            id: "a2",
            title: "Siri gets major update in upcoming iOS release",
            summary: "Siri receives an intelligence upgrade, enabling deep context-aware answers and action triggers.",
            source: "The Guardian",
            url: "https://example.com/siri-upgrade",
            publishedAt: new Date(Date.now() - 3600000 * 3).toISOString()
          }
        ]
      };
    } else if (id === "c2") {
      return {
        id: "c2",
        label: "Global Green Energy Production Records",
        articles: [
          {
            id: "a3",
            title: "Solar output hits new record highs across western Europe",
            summary: "High sunshine volumes and new panel installations pushed solar energy production to record numbers.",
            source: "BBC News",
            url: "https://example.com/solar-record",
            publishedAt: new Date(Date.now() - 3600000 * 7).toISOString()
          },
          {
            id: "a4",
            title: "Wind and Solar Surge: Green Grid Targets Achieved Ahead of Schedule",
            summary: "Renewable energy deployment in North America has overtaken grid targets by two years.",
            source: "The Guardian",
            url: "https://example.com/solar-surge-milestone",
            publishedAt: new Date(Date.now() - 3600000 * 6).toISOString()
          }
        ]
      };
    }

    return null;
  }
}