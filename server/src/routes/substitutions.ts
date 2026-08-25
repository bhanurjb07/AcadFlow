import { Router } from 'express';
import { getSubstitutions } from '../controllers/substitutionController';

const router = Router();

router.get('/', getSubstitutions);

export default router;
