import { addResult, deleteResult, getResultById, getResults, updatePublishStatus, updateResult } from '@/lib/controllers/result/result.controller';

import express from 'express'
const router = express.Router()

router.get('/get', getResults);
router.post('/create', addResult);
router.put('/update', updateResult);
router.delete('/delete', deleteResult);
router.get('/get-details', getResultById);
router.put('/update-result-status', updatePublishStatus)

export { router }