import express from 'express';

import { authenticateTokenMiddleware } from '../middlewares/auth.middleware';


import { router as authRoutes } from './auth';
import { router as commonRoutes } from './common';
import { router as DbSeedersRoutes } from './dbSeed';
import { router as CampaignRoutes } from './campaign/campaign.routes';
import { router as DropDownRoutes } from './dropdown/dropdown.routes';
import {router as  chatRoutes } from './chat/chat.routes';
const router = express.Router()
router.use('/auth', authRoutes)

router.use(authenticateTokenMiddleware)

router.use('/chat',chatRoutes)
router.use('/seed', DbSeedersRoutes);
router.use('/campaign', CampaignRoutes);
router.use('/dropdown', DropDownRoutes);
router.use('/common', commonRoutes);

export { router as routesv1 };
