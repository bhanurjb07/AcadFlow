import { Router } from 'express';
import {
  getProfile,
  getDashboardData,
  getTodayClasses,
  getAvailability,
  setAvailability,
} from '../controllers/teacherController';
import { authorize } from '../middleware/auth';

const router = Router();

router.use(authorize(['teacher', 'admin']));

router.get('/profile', getProfile);
router.get('/dashboard', getDashboardData);
router.get('/classes/today', getTodayClasses);
router.get('/availability', getAvailability);
router.post('/availability', setAvailability);

export default router;
