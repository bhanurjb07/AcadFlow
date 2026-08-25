import { Router } from 'express';
import { getNotices, createNotice, deleteNotice } from '../controllers/noticeController';
import { authorize } from '../middleware/auth';

const router = Router();

router.get('/', getNotices);
router.post('/', authorize(['admin', 'teacher']), createNotice);
router.delete('/:noticeId', authorize(['admin']), deleteNotice);

export default router;
