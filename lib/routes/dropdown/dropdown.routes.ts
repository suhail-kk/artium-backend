import express from 'express'
import { getCreatorsCount, getDeliveryTypes, getVideoTypes } from '@/lib/controllers/dropdown/dropdown.controller'

const router = express.Router()

router.get('/video-types', getVideoTypes);
router.get('/creators-count', getCreatorsCount);
router.get('/delivery-types', getDeliveryTypes);

export { router }