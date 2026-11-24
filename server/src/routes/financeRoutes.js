import { Router } from 'express';
import {
  transactionController,
  savingController,
  getFinanceSummary,
} from '../controllers/financeController.js';
import { protect } from '../middleware/auth.js';
import { resourceRouter } from '../utils/resources.js';

const router = Router();
router.use(protect);

router.get('/finance/summary', getFinanceSummary);
router.use('/transactions', resourceRouter(transactionController));
router.use('/savings', resourceRouter(savingController));

export default router;
