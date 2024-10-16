import express from 'express'
import { dbSeedController } from '@/lib/controllers/dbSeed.controller'
const router = express.Router()

router.post('/seed-all', dbSeedController)

export { router as DbSeedersRoutes }