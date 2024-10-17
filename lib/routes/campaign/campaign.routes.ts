import express from 'express'
import { multerErrorHandler, upload } from '@/lib/utils/storage.utils'
import { createCampaign, deleteCampaign, getCampaignById, getCampaigns, updateCampaign } from '@/lib/controllers/campaign/campaign.controller'

const router = express.Router()

router.post('/create',upload.fields([{ 
    name: 'logo_image', 
    maxCount: 1 
  }, 
  { 
    name: 'product_image', 
    maxCount: 1 
  }
]), multerErrorHandler,createCampaign)


router.put('/update', updateCampaign)
router.delete('/delete', deleteCampaign)
router.get('/get', getCampaigns)
router.get('/view',getCampaignById)

export { router as CampaignRoutes }