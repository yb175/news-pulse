import { Router } from 'express';
import { ClusterController } from '../controllers/cluster.controller';

const router = Router();
const controller = new ClusterController();

router.get('/', controller.getClusters);
router.get('/:id', controller.getClusterDetails);

export default router;
