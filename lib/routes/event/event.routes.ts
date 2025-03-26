import { createEvent, deleteEvent, getEventById, getEvents, publishEvent, updateEvent } from '@/lib/controllers/event/event.controller';

import express from 'express'
const router = express.Router()

router.get('/get', getEvents);
router.put('/update', updateEvent);
router.post('/create', createEvent);
router.delete('/delete', deleteEvent);
router.get('/get-details', getEventById);
router.put('/publish-status-change', publishEvent);

export { router }

