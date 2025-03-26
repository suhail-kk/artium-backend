import { createProgram, deleteProgram, getProgramById, getPrograms, lockProgramStatus, updateProgram } from '@/lib/controllers/program/program.controller';

import express from 'express'
const router = express.Router()

router.post('/create', createProgram);
router.put('/update', updateProgram);
router.delete('/delete', deleteProgram);
router.get('/get', getPrograms);
router.get('/get-details', getProgramById);
router.put('/registration-lock-status', lockProgramStatus);

export { router }