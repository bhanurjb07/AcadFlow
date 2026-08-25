import { Router } from 'express';
import {
  startSession,
  getSessionDetails,
  markAttendance,
  batchMarkAttendance,
  lockSession,
  generateQRCodes,
} from '../controllers/attendanceController';
import { authorize } from '../middleware/auth';

const router = Router();

// Accessible by teacher and admin
router.use(authorize(['teacher', 'admin']));

router.post('/start', startSession);
router.get('/:sessionId', getSessionDetails);
router.patch('/mark', markAttendance);
router.patch('/batch', batchMarkAttendance);
router.patch('/:sessionId/lock', lockSession);
router.get('/:sessionId/qr', generateQRCodes);

export default router;
