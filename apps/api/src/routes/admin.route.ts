import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';

export const adminRouter = Router();

adminRouter.get('/ping', authenticate, requireRole('admin'), (_req, res) => {
  res.json({ ok: true, data: { message: 'Admin route is protected', messageBn: 'Admin route সুরক্ষিত আছে।' } });
});
