import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { authLimiter } from '../../middleware/rate-limit.js';
import { login, logout, me, register } from './auth.controller.js';

function asyncRoute(handler: any) {
  return (req: any, res: any, next: any) => Promise.resolve(handler(req, res, next)).catch(next);
}

export const authRouter = Router();

authRouter.post('/register', authLimiter, asyncRoute(register));
authRouter.post('/login', authLimiter, asyncRoute(login));
authRouter.post('/logout', asyncRoute(logout));
authRouter.get('/me', authenticate, asyncRoute(me));
