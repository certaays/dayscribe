import { Router } from 'express';
import {
  getHabits,
  createHabit,
  updateHabit,
  deleteHabit,
  logHabit,
} from '../controllers/habitsController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth);

router.get('/', getHabits);
router.post('/', createHabit);
router.put('/:id', updateHabit);
router.delete('/:id', deleteHabit);
router.post('/:id/log', logHabit);

export default router;
