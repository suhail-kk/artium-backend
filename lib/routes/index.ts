import express from 'express'
import { authRoutes } from './auth'
const router = express.Router()


import { router as commonRoutes } from './common';

router.use('/auth', authRoutes);
router.use('/common', commonRoutes);

export { router as routesv1 };
