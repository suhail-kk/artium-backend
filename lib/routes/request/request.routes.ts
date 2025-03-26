import { getRequests } from '@/lib/controllers/request/request.controller';

import express from 'express'
const router = express.Router()

router.get('/get', getRequests);

export { router }