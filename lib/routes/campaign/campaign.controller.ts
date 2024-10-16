import express from 'express'
import { createCampaign, deleteCampaign, getCampaignById, getCampaigns, updateCampaign } from '@/lib/controllers/campaign.controller'

const router = express.Router()

router.post('/create', createCampaign)
router.put('/update', updateCampaign)
router.delete('/delete', deleteCampaign)
router.get('/get', getCampaigns)
router.get('/view',getCampaignById)

export { router as CampaignRoutes }