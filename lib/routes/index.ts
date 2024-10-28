import express from 'express';
const router = express.Router();

import { router as authRoutes } from './auth';
import { router as commonRoutes } from './common';
import { router as DbSeedersRoutes } from './dbSeed';
import { router as CampaignRoutes } from './campaign/campaign.routes';
import { router as DropDownRoutes } from './dropdown/dropdown.routes';
import { router as CreatorsRoutes } from './creators/creators.routes';

router.use('/auth', authRoutes);
router.use('/common', commonRoutes);
router.use('/seed', DbSeedersRoutes);
router.use('/campaign', CampaignRoutes);
router.use('/dropdown', DropDownRoutes);
router.use('/creators', CreatorsRoutes);

export { router as routesv1 };
