import express from 'express';
const router = express.Router();

import { router as authRoutes } from './auth';
import { router as DbSeedersRoutes } from './dbSeed';
import { router as CampaignRoutes } from './campaign/campaign.routes';
import { router as DropDownRoutes } from './dropdown/dropdown.routes';

router.use('/auth', authRoutes);
router.use('/seed', DbSeedersRoutes);
router.use('/campaign', CampaignRoutes);
router.use('/dropdown', DropDownRoutes);

export { router as routesv1 };
