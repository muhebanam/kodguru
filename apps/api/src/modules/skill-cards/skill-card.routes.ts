import { Router } from 'express';
import { authenticate, optionalAuthenticate, requireRole } from '../../middleware/auth.middleware.js';
import {
  createSkillCard,
  deleteSkillCard,
  exportSkillCards,
  getSkillCard,
  importSkillCards,
  listSkillCards,
  updateSkillCard,
  updateSkillCardStatus,
} from './skill-card.controller.js';
import { asyncRoute } from './skill-card.utils.js';

export const skillCardRouter = Router();

skillCardRouter.get('/', optionalAuthenticate, asyncRoute(listSkillCards));
skillCardRouter.get('/export', authenticate, requireRole('admin'), asyncRoute(exportSkillCards));
skillCardRouter.post('/import', authenticate, requireRole('admin'), asyncRoute(importSkillCards));
skillCardRouter.post('/', authenticate, requireRole('admin'), asyncRoute(createSkillCard));
skillCardRouter.get('/:slug', optionalAuthenticate, asyncRoute(getSkillCard));
skillCardRouter.patch('/:slug/status', authenticate, requireRole('admin', 'teacher'), asyncRoute(updateSkillCardStatus));
skillCardRouter.patch('/:slug', authenticate, requireRole('admin'), asyncRoute(updateSkillCard));
skillCardRouter.delete('/:slug', authenticate, requireRole('admin'), asyncRoute(deleteSkillCard));
