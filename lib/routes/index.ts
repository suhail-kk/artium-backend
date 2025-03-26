import express from 'express';

import { router as DbSeedersRoutes } from '@/lib/routes/dbSeed';
import { router as AuthRoutes } from '@/lib/routes/auth/auth.routes';
import { router as UsersRoutes } from '@/lib/routes/users/users.routes';
import { router as EventRoutes } from '@/lib/routes/event/event.routes';
import { router as StageRoutes } from '@/lib/routes/stage/stage.routes';
import { router as ResultRoutes } from '@/lib/routes/result/result.routes';
import { router as ProgramRoutes } from '@/lib/routes/program/program.routes';
import { router as RequestRoutes } from '@/lib/routes/request/request.routes';
import { router as commonRoutes } from '@/lib/routes/common/dropdown.routes';
import { authenticateTokenMiddleware } from '@/lib/middlewares/auth.middleware';
import { router as ApplicantRoutes } from '@/lib/routes/applicant/applicant.routes';
import { router as AttendanceRoutes } from '@/lib/routes/attendance/attendance.routes';
import { router as InvigilatorRoutes } from '@/lib/routes/invigilator/invigilator.routes';
import { router as ProgramRegistrationRoutes } from '@/lib/routes/programRegistration/programRegistration.routes';

const router = express.Router()

router.use('/auth', AuthRoutes);
router.use('/common', commonRoutes);

router.use('/users', UsersRoutes);
// router.use(authenticateTokenMiddleware)

router.use('/stage', StageRoutes);
router.use('/event', EventRoutes);
router.use('/result', ResultRoutes);
router.use('/seed', DbSeedersRoutes);
router.use('/program', ProgramRoutes);
router.use('/request', RequestRoutes);
router.use('/applicant', ApplicantRoutes);
router.use('/attendance', AttendanceRoutes);
router.use('/invigilator', InvigilatorRoutes);
router.use('/program-register', ProgramRegistrationRoutes);


export { router as routesv1 };
