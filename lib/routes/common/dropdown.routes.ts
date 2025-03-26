import { getEventType } from '@/lib/controllers/dropdown/eventType.controller';
import { getGender } from '@/lib/controllers/dropdown/gender.controller';
import { getProgramTypes } from '@/lib/controllers/dropdown/programType.controller';
import { getRole } from '@/lib/controllers/dropdown/role.controller';
import express from 'express'

const router = express.Router()

router.get('/roles', getRole);
router.get('/genders', getGender);
router.get('/event-types', getEventType);
router.get('/program-types', getProgramTypes);

export { router }