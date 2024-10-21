import express from 'express'
import { authRoutes } from './auth'
const router = express.Router()


import { router as commonRoutes } from './common';
import { router as DbSeedersRoutes } from './dbSeed';
import { router as CampaignRoutes } from './campaign/campaign.routes';
import { router as DropDownRoutes } from './dropdown/dropdown.routes';

router.use('/auth', authRoutes);
router.use('/seed', DbSeedersRoutes);
router.use('/campaign', CampaignRoutes);
router.use('/dropdown', DropDownRoutes);
router.use('/common', commonRoutes);

export { router as routesv1 };
