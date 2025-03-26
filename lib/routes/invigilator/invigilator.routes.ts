import { changeInviteStatus, deleteInvigilator, getFacultiesNotInvited, getInvigilatorById, getInvigilators, inviteInvigilator, updateEventStatus, updateInvigilator, updateStatus } from '@/lib/controllers/invigilator/invigilator.controller';

import express from 'express'
const router = express.Router()

router.get('/get', getInvigilators);
router.put('/update', updateInvigilator);
router.post('/update-status', updateStatus)
router.delete('/delete', deleteInvigilator);
router.get('/get-details', getInvigilatorById);
router.post('/invite-invigilator', inviteInvigilator);
router.put('/event-status-change', updateEventStatus);
router.post('/request-status-change', changeInviteStatus);
router.get('/faculties-not-invited', getFacultiesNotInvited)

export { router }