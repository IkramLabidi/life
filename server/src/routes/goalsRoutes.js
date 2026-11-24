import { Router } from 'express';
import { goalController, journalController } from '../controllers/goalsController.js';
import { protect } from '../middleware/auth.js';
import { resourceRouter } from '../utils/resources.js';

const router = Router();
router.use(protect);

router.use('/goals', resourceRouter(goalController));
router.use('/journal', resourceRouter(journalController));

export default router;
