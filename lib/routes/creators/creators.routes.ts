
import { getCreators } from '@/lib/controllers/creators/creators.controller';
import { authenticateTokenMiddleware } from '@/lib/middlewares/auth.middleware';

const express = require('express');
const router = express.Router()

router.use(authenticateTokenMiddleware);
router.get('/get', getCreators)

export { router }