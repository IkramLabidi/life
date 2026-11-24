import { Router } from 'express';
import {
  taskController,
  weeklyGoalController,
  cycleController,
  getWeeklyReview,
  upsertWeeklyReview,
  getCurrentCycle,
} from '../controllers/plannerController.js';
import { protect } from '../middleware/auth.js';
import { resourceRouter } from '../utils/resources.js';

const router = Router();
router.use(protect);

router.get('/weekly-review', getWeeklyReview);
router.put('/weekly-review', upsertWeeklyReview);

router.get('/cycle/current', getCurrentCycle);
router.use('/cycle', resourceRouter(cycleController));

router.use('/tasks', resourceRouter(taskController));
router.use('/weekly-goals', resourceRouter(weeklyGoalController));

export default router;
