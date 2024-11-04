
import { createApplicantValidator } from '@/lib/rules/validators/applicant';
import { authenticateTokenMiddleware } from '@/lib/middlewares/auth.middleware';
import { createApplicant, deleteApplicant, getApplicants, getApplicantStatus, updateApplicant } from '@/lib/controllers/campaign/applicants.controller';

const express = require('express');
const router = express.Router()

router.use(authenticateTokenMiddleware);
router.get('/get', authenticateTokenMiddleware, getApplicants)
router.put('/update', authenticateTokenMiddleware, updateApplicant)
router.delete('/delete', authenticateTokenMiddleware, deleteApplicant)
router.get('/get-status', authenticateTokenMiddleware, getApplicantStatus)
router.post('/create', authenticateTokenMiddleware, createApplicantValidator(), createApplicant)



export { router }