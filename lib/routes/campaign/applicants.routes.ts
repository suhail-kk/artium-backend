
import { createApplicantValidator } from '@/lib/rules/validators/applicant';
import { authenticateTokenMiddleware } from '@/lib/middlewares/auth.middleware';
import { createApplicant, deleteApplicant, getApplicants, updateApplicant } from '@/lib/controllers/campaign/applicants.controller';

const express = require('express');
const router = express.Router()

router.use(authenticateTokenMiddleware);
router.post('/create', authenticateTokenMiddleware, createApplicantValidator(), createApplicant)
router.put('/update', authenticateTokenMiddleware, updateApplicant)
router.delete('/delete', authenticateTokenMiddleware, deleteApplicant)
router.get('/get', authenticateTokenMiddleware, getApplicants)

export { router }