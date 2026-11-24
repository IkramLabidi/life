import { Router } from 'express';
import { eventController, getCalendarRange } from '../controllers/calendarController.js';
import { protect } from '../middleware/auth.js';
import { resourceRouter } from '../utils/resources.js';

const router = Router();
router.use(protect);

router.get('/calendar', getCalendarRange);
router.use('/events', resourceRouter(eventController));

export default router;
