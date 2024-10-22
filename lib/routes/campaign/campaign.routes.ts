
import { createCampaignValidator } from '@/lib/rules/validators/campaign';
import { createCampaign, deleteCampaign, getCampaignById, getCampaigns, updateCampaign } from '@/lib/controllers/campaign/campaign.controller'

const express = require('express');
const router = express.Router()

router.post('/create', createCampaignValidator(), createCampaign)


router.put('/update', updateCampaign)
router.delete('/delete', deleteCampaign)
router.get('/get', getCampaigns)
router.get('/view', getCampaignById)

export { router }