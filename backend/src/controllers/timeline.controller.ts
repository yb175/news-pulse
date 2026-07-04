import { Request, Response } from 'express';
import { TimelineService } from '../services/timeline.service';

// This controller receives incoming requests for news timelines.
// In a real product, it queries services and sends JSON payloads.

export class TimelineController {
  private service = new TimelineService();

  getTimeline = async (req: Request, res: Response) => {
    try {
      console.log("TimelineController.getTimeline() stub called");
      const days = req.query.days ? parseInt(req.query.days as string, 10) : 7;
      const sourcesQuery = req.query.sources as string | undefined;
      const sources = sourcesQuery ? sourcesQuery.split(',') : undefined;

      const timeline = await this.service.getTimeline(days, sources);
      return res.status(200).json(timeline);
    } catch (error) {
      console.error('Error in getTimeline:', error);
      return res.status(500).json({ error: 'Internal Server Error.' });
    }
  };
}