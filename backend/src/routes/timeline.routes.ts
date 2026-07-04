import { Router } from 'express';
import { TimelineController } from '../controllers/timeline.controller';

const router = Router();
const controller = new TimelineController();

router.route('/')
  .get(controller.getTimeline)
  .all((req, res) => {
    res.status(405).json({ error: 'Method Not Allowed' });
  });

export default router;
