import { createApplicant, deleteApplicant, getApplicantById, getApplicants } from '@/lib/controllers/applicant/applicant.controller';

import express from 'express'
const router = express.Router()

router.get('/get', getApplicants);
router.post('/create', createApplicant);
router.delete('/delete', deleteApplicant);
router.get('/get-details', getApplicantById);

export { router }