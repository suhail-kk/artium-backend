import express from 'express';
const router = express.Router();

import { router as authRoutes } from './auth';
import { router as commonRoutes } from './common';

router.use('/auth', authRoutes);
router.use('/common', commonRoutes);

export { router as routesv1 };
