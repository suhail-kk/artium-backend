
import { authenticateTokenMiddleware } from '@/lib/middlewares/auth.middleware';
import { getCreators, RemoveASavedCreator, saveCreator } from '@/lib/controllers/creators/creators.controller';

const express = require('express');
const router = express.Router()

router.use(authenticateTokenMiddleware);
router.get('/get', getCreators)
router.post('/save', saveCreator)
router.post('/unsave', RemoveASavedCreator)


export { router }