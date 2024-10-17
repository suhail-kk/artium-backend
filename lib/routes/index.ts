import express from 'express'
import { authRoutes } from './auth'
const router = express.Router()


router.use('/auth',authRoutes)
export { router as routesv1 }
