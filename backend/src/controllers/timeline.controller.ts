import { Request, Response, NextFunction } from 'express';
import { TimelineService } from '../services/timeline.service';
import { HttpError } from '../middleware/error.middleware';

export class TimelineController {
  private service = new TimelineService();

  getTimeline = async (req: Request, res: Response, next: NextFunction) => {
    try {
      let days = 7;
      if (req.query.days !== undefined) {
        const daysStr = String(req.query.days);
        if (!/^\d+$/.test(daysStr)) {
          return next(new HttpError(400, 'Invalid days parameter.'));
        }
        const parsedDays = parseInt(daysStr, 10);
        if (parsedDays <= 0) {
          return next(new HttpError(400, 'Invalid days parameter.'));
        }
        days = parsedDays;
      }

      const sourcesQuery = req.query.sources as string | undefined;
      let sources: string[] | undefined = undefined;

      if (sourcesQuery !== undefined && typeof sourcesQuery === 'string' && sourcesQuery.trim() !== '') {
        const parsedSources = sourcesQuery.split(',').map(s => s.trim()).filter(s => s !== '');
        if (parsedSources.length > 0) {
          sources = parsedSources;
        }
      }

      const timeline = await this.service.getTimeline(days, sources);
      return res.status(200).json(timeline);
    } catch (error) {
      next(error);
    }
  };
}