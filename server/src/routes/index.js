import { Router } from 'express';
import authRoutes from './authRoutes.js';
import financeRoutes from './financeRoutes.js';
import plannerRoutes from './plannerRoutes.js';
import healthRoutes from './healthRoutes.js';
import studyRoutes from './studyRoutes.js';
import calendarRoutes from './calendarRoutes.js';
import goalsRoutes from './goalsRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/', financeRoutes);
router.use('/', plannerRoutes);
router.use('/', healthRoutes);
router.use('/', studyRoutes);
router.use('/', calendarRoutes);
router.use('/', goalsRoutes);
router.use('/', dashboardRoutes);

export default router;
