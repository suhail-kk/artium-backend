
import { createCampaignValidator } from '@/lib/rules/validators/campaign';
import { createCampaign, deleteCampaign, getAppliedCampaigns, getCampaignById, getCampaigns, getNumberOfApplicant, getUserCampaigns, updateCampaign } from '@/lib/controllers/campaign/campaign.controller'
import { authenticateTokenMiddleware } from '@/lib/middlewares/auth.middleware';

const express = require('express');
const router = express.Router()

router.use(authenticateTokenMiddleware);
router.get('/get', authenticateTokenMiddleware, getCampaigns)
router.get('/view', authenticateTokenMiddleware, getCampaignById)
router.put('/update', authenticateTokenMiddleware, updateCampaign)
router.delete('/delete', authenticateTokenMiddleware, deleteCampaign)
router.get('/my-campaigns', authenticateTokenMiddleware, getUserCampaigns)
router.get('/applied-campaigns', authenticateTokenMiddleware, getAppliedCampaigns)
router.get('/applicants-count', authenticateTokenMiddleware, getNumberOfApplicant)
router.post('/create', authenticateTokenMiddleware, createCampaignValidator(), createCampaign)


export { router }