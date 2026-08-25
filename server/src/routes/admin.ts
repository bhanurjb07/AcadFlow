import { Router } from 'express';
import {
  getDashboardStats,
  getStudents,
  createStudent,
  getTeachers,
  createTeacher,
  getClassrooms,
  createClassroom,
  getSubjects,
  createSubject,
  getSchedules,
  createSchedule,
  generateSeating,
  getClassroomSeatingGrid,
  findSubstitutes,
  assignSubstitute,
} from '../controllers/adminController';
import { authorize } from '../middleware/auth';

const router = Router();

router.use(authorize(['admin']));

router.get('/stats', getDashboardStats);

router.get('/students', getStudents);
router.post('/students', createStudent);

router.get('/teachers', getTeachers);
router.post('/teachers', createTeacher);

router.get('/classrooms', getClassrooms);
router.post('/classrooms', createClassroom);

router.get('/subjects', getSubjects);
router.post('/subjects', createSubject);

router.get('/schedules', getSchedules);
router.post('/schedules', createSchedule);

router.post('/seating/generate', generateSeating);
router.get('/seating/:classroomId', getClassroomSeatingGrid);

router.post('/substitution/candidates', findSubstitutes);
router.post('/substitution/assign', assignSubstitute);

export default router;
