import { Request, Response } from 'express';
import { ClusterService } from '../services/cluster.service';

export class ClusterController {
  private service = new ClusterService();

  getClusters = async (req: Request, res: Response) => {
    try {
      const clusters = await this.service.getAllClusters();
      return res.status(200).json(clusters);
    } catch (error) {
      console.error('Error fetching clusters:', error);
      return res.status(500).json({ error: 'Internal Server Error.' });
    }
  };

  getClusterDetails = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const details = await this.service.getClusterDetails(id);
      if (!details) {
        return res.status(404).json({ error: 'Cluster not found.' });
      }
      return res.status(200).json(details);
    } catch (error) {
      console.error('Error fetching cluster details:', error);
      return res.status(500).json({ error: 'Internal Server Error.' });
    }
  };
}
