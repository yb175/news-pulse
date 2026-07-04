import { Router } from 'express';
import { IngestController } from '../controllers/ingest.controller';

const router = Router();
const controller = new IngestController();

router.route('/trigger')
  .post((req, res) => {
    res.status(403).json({ error: 'Ingestion can only be triggered by the backend scheduler.' });
  })
  .all((req, res) => {
    res.status(405).json({ error: 'Method Not Allowed' });
  });

router.route('/status/:jobId')
  .get(controller.getJobStatus)
  .all((req, res) => {
    res.status(405).json({ error: 'Method Not Allowed' });
  });

export default router;
