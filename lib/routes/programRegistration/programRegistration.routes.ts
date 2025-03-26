import { deleteProgramRegistration, getProgramRegistrationById, getRegisteredUsers, registerForProgram } from '@/lib/controllers/programRegistration/programRegistration.controller';

import express from 'express'
const router = express.Router()

router.get('/get', getRegisteredUsers);
router.post('/create', registerForProgram);
router.delete('/delete', deleteProgramRegistration);
router.get('/get-details', getProgramRegistrationById);

export { router }