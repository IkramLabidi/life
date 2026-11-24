import { Router } from 'express';
import {
  mealController,
  exerciseController,
  measurementController,
  listWater,
  upsertWater,
  deleteWater,
} from '../controllers/healthController.js';
import { protect } from '../middleware/auth.js';
import { resourceRouter } from '../utils/resources.js';

const router = Router();
router.use(protect);

router.get('/water', listWater);
router.post('/water', upsertWater);
router.delete('/water/:id', deleteWater);

router.use('/meals', resourceRouter(mealController));
router.use('/measurements', resourceRouter(measurementController));
router.use('/exercises', resourceRouter(exerciseController));

export default router;
