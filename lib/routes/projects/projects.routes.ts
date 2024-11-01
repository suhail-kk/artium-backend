import { projectsValidator } from '@/lib/rules/validators/projects';
import { authenticateTokenMiddleware } from '@/lib/middlewares/auth.middleware';
import { createProjects, deleteProject, getProjects } from '@/lib/controllers/projects/projects.controller';

const express = require('express');
const router = express.Router()

router.use(authenticateTokenMiddleware);
router.get('/get', authenticateTokenMiddleware, getProjects)
router.post('/create', authenticateTokenMiddleware, projectsValidator(), createProjects)
router.delete('/delete', authenticateTokenMiddleware, deleteProject)

export { router }