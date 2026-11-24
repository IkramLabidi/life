import { Router } from 'express';
import {
  subjectController,
  studyTaskController,
  studySessionController,
  listDeadlines,
  createDeadline,
  updateDeadline,
  deleteDeadline,
} from '../controllers/studyController.js';
import { protect } from '../middleware/auth.js';
import { resourceRouter } from '../utils/resources.js';

const router = Router();
router.use(protect);

router.get('/deadlines', listDeadlines);
router.post('/deadlines', createDeadline);
router.put('/deadlines/:id', updateDeadline);
router.delete('/deadlines/:id', deleteDeadline);

router.use('/subjects', resourceRouter(subjectController));
router.use('/study-tasks', resourceRouter(studyTaskController));
router.use('/study-sessions', resourceRouter(studySessionController));

export default router;
