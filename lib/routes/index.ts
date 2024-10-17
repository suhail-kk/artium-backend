import express from 'express';
const router = express.Router();

import { router as authRoutes } from './auth';

router.use('/auth', authRoutes);

export { router as routesv1 };
