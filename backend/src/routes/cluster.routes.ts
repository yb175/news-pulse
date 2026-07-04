import { Router } from 'express';
import { ClusterController } from '../controllers/cluster.controller';

const router = Router();
const controller = new ClusterController();

router.route('/')
  .get(controller.getClusters)
  .all((req, res) => {
    res.status(405).json({ error: 'Method Not Allowed' });
  });

router.route('/:id')
  .get(controller.getClusterDetails)
  .all((req, res) => {
    res.status(405).json({ error: 'Method Not Allowed' });
  });

export default router;
