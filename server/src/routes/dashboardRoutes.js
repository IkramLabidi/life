import { Router } from 'express';
import { getDashboard } from '../controllers/dashboardController.js';
import { getMonthlyReport } from '../controllers/reportController.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.use(protect);

router.get('/dashboard', getDashboard);
router.get('/reports/monthly', getMonthlyReport);

export default router;
