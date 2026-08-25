import { Router } from 'express';
import {
  createExam,
  getAllExams,
  recordMarks,
  getExamResults,
} from '../controllers/examController';
import { authorize } from '../middleware/auth';

const router = Router();

router.get('/', getAllExams);
router.post('/', authorize(['teacher', 'admin']), createExam);
router.post('/marks', authorize(['teacher', 'admin']), recordMarks);
router.get('/:examId/results', getExamResults);

export default router;
