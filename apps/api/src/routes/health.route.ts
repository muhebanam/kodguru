import { Router } from 'express';
import { getDbStatus } from '../config/db.js';

export const healthRouter = Router();

healthRouter.get('/', (_req, res) => {
  res.json({
    ok: true,
    data: {
      service: 'kodguru-api',
      status: 'up',
      db: getDbStatus(),
      time: new Date().toISOString(),
    },
  });
});

/** Production readiness: deploy platform চাইলে এটি ব্যবহার করবে। */
healthRouter.get('/ready', (_req, res) => {
  const db = getDbStatus();
  const ready = db === 'connected';
  res.status(ready ? 200 : 503).json({
    ok: ready,
    ...(ready
      ? { data: { service: 'kodguru-api', ready: true, db } }
      : {
          error: {
            code: 'SERVICE_NOT_READY',
            message: 'Database is not connected',
            messageBn: 'ডাটাবেস এখনও connected নয়',
          },
        }),
  });
});
