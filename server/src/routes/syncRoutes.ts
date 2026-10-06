import { Router } from 'express';
import { bulkSync } from '../controllers/syncController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth);

router.post('/', bulkSync);

export default router;
