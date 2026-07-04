import { Router } from 'express';
import { TimelineController } from '../controllers/timeline.controller';

const router = Router();
const controller = new TimelineController();

router.get('/', controller.getTimeline);

export default router;
