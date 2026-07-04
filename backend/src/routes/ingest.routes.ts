import { Router } from 'express';
import { IngestController } from '../controllers/ingest.controller';

const router = Router();
const controller = new IngestController();

router.route('/trigger')
  .post(controller.triggerIngestion)
  .all((req, res) => {
    res.status(405).json({ error: 'Method Not Allowed' });
  });

router.route('/status/:jobId')
  .get(controller.getJobStatus)
  .all((req, res) => {
    res.status(405).json({ error: 'Method Not Allowed' });
  });

export default router;
