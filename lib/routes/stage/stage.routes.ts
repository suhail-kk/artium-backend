import { createStage, deleteStage, getStageById, getStages, updateStage } from '@/lib/controllers/stage/stage.controller';

import express from 'express'
const router = express.Router()

router.post('/create', createStage);
router.put('/update', updateStage);
router.delete('/delete', deleteStage);
router.get('/get', getStages);
router.get('/get-details', getStageById);

export { router }