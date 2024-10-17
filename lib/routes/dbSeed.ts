import express from 'express'
import db from '@/lib/controllers/dbSeed.controller'
const router = express.Router()

router.post('/seed-all', db)

export { router }