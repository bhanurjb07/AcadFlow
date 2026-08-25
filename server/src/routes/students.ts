import { Router } from 'express';
import {
  getProfile,
  getAttendanceSummary,
  getExamResults,
  getTodayClasses,
  getTimetable,
  getDailySeat,
  getClassroomSeating,
} from '../controllers/studentController';
import { authorize } from '../middleware/auth';

const router = Router();

// Student role protected routes
router.use(authorize(['student', 'admin', 'teacher']));

router.get('/profile', getProfile);
router.get('/attendance', getAttendanceSummary);
router.get('/exams', getExamResults);
router.get('/classes/today', getTodayClasses);
router.get('/timetable', getTimetable);
router.get('/seat/today', getDailySeat);
router.get('/seating/:classroomId', getClassroomSeating);

export default router;
