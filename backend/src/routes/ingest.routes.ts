import { Router } from 'express';
import { IngestController } from '../controllers/ingest.controller';

const router = Router();
const controller = new IngestController();

router.post('/trigger', controller.triggerIngestion);
router.get('/status/:jobId', controller.getJobStatus);

export default router;
