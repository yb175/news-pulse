import { Request, Response, NextFunction } from 'express';
import { ClusterService } from '../services/cluster.service';
import { HttpError } from '../middleware/error.middleware';

export class ClusterController {
  private service = new ClusterService();

  getClusters = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const clusters = await this.service.getAllClusters();
      return res.status(200).json(clusters);
    } catch (error) {
      next(error);
    }
  };

  getClusterDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      // Validate that id is a valid UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id)) {
        return next(new HttpError(400, 'Invalid cluster ID format.'));
      }

      const details = await this.service.getClusterDetails(id);
      if (!details) {
        return next(new HttpError(404, 'Cluster not found.'));
      }
      return res.status(200).json(details);
    } catch (error) {
      next(error);
    }
  };
}
