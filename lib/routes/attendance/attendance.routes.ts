import { deleteAttendance, getAttendanceById, getAttendances, markAttendance } from '@/lib/controllers/attendance/attendance.controller';

import express from 'express'
const router = express.Router()

router.get('/get', getAttendances);
router.post('/create', markAttendance);
router.delete('/delete', deleteAttendance);
router.get('/get-details', getAttendanceById);

export { router }