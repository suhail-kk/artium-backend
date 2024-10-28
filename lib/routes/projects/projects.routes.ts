
import { createCampaignValidator } from '@/lib/rules/validators/campaign';
import { createCampaign, deleteCampaign, getCampaignById, getCampaigns, getUserCampaigns, updateCampaign } from '@/lib/controllers/campaign/campaign.controller'
import { authenticateTokenMiddleware } from '@/lib/middlewares/auth.middleware';
import { createFeaturedProjects, deleteFeaturedProject, getFeaturedProjects } from '@/lib/controllers/projects/featuredProjects.controller';
import { createAdditionalProjects, deleteAdditionalProject, getAdditionalProjects } from '@/lib/controllers/projects/additionalProjects.controller';

const express = require('express');
const router = express.Router()

router.use(authenticateTokenMiddleware);
router.get('/get/featured', authenticateTokenMiddleware, getFeaturedProjects)
router.post('/create/featured', authenticateTokenMiddleware, createFeaturedProjects)
router.delete('/delete/featured', authenticateTokenMiddleware, deleteFeaturedProject)

router.get('/get/additional', authenticateTokenMiddleware, getAdditionalProjects)
router.post('/create/additional', authenticateTokenMiddleware, createAdditionalProjects)
router.delete('/delete/additional', authenticateTokenMiddleware, deleteAdditionalProject)

export { router }