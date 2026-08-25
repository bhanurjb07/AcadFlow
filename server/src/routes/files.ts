import { Router } from 'express';
import { uploadFile } from '../controllers/fileController';
import { upload } from '../services/fileUploadService';

const router = Router();

router.post('/upload', upload.single('file'), uploadFile);

export default router;
