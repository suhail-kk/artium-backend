import { getUserById, getUsers } from '@/lib/controllers/users/users.controller';

import express from 'express'
const router = express.Router()

router.get('/get', getUsers);
router.get('/get-details', getUserById);

export { router }