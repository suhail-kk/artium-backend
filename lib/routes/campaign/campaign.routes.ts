
import { createCampaignValidator } from '@/lib/rules/validators/campaign';
import { createCampaign, deleteCampaign, getCampaignById, getCampaigns, getUserCampaigns, updateCampaign } from '@/lib/controllers/campaign/campaign.controller'
import { authenticateTokenMiddleware } from '@/lib/middlewares/auth.middleware';

const express = require('express');
const router = express.Router()

router.use(authenticateTokenMiddleware);
router.post('/create', authenticateTokenMiddleware, createCampaignValidator(), createCampaign)
router.put('/update', authenticateTokenMiddleware, updateCampaign)
router.delete('/delete', authenticateTokenMiddleware, deleteCampaign)
router.get('/get', authenticateTokenMiddleware, getCampaigns)
router.get('/my-campaigns', authenticateTokenMiddleware, getUserCampaigns)
router.get('/view', authenticateTokenMiddleware, getCampaignById)

export { router }