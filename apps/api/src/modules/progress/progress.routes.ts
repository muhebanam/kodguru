import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { postCompleteCard, getProgressMe, getCurriculumRoute, getMapRoute } from './progress.controller.js';

/** Progress / XP routes */
export const progressRouter = Router();
progressRouter.get('/curriculum', getCurriculumRoute);       // public: milestone/module map
progressRouter.get('/me', authenticate, getProgressMe);
progressRouter.get('/map', authenticate, getMapRoute);       // আমার XP/level/streak
progressRouter.post('/complete-card', authenticate, postCompleteCard); // কার্ড শেষ → XP
