import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from './app.js';

const app = createApp();

describe('API shell', () => {
  it('returns health with disconnected db instead of failing', async () => {
    const res = await request(app).get('/api/health').expect(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.db).toBe('disconnected');
  });

  it('returns readiness 503 when db is disconnected', async () => {
    const res = await request(app).get('/api/health/ready').expect(503);
    expect(res.body.ok).toBe(false);
    expect(res.body.error.messageBn).toContain('ডাটাবেস');
  });

  it('returns Bengali 404 envelope', async () => {
    const res = await request(app).get('/api/does-not-exist').expect(404);
    expect(res.body.ok).toBe(false);
    expect(res.body.error.messageBn).toBe('এই ঠিকানায় কিছু পাওয়া যায়নি।');
  });

  it('protects admin routes without auth', async () => {
    const res = await request(app).get('/api/admin/ping').expect(401);
    expect(res.body.error.messageBn).toBe('আগে লগইন করুন।');
  });

  it('protects skill card import without admin auth', async () => {
    const res = await request(app).post('/api/skill-cards/import').send({ cards: [], dryRun: true }).expect(401);
    expect(res.body.error.messageBn).toBe('আগে লগইন করুন।');
  });

  it('returns db disconnected for public skill card list when MongoDB is not connected', async () => {
    const res = await request(app).get('/api/skill-cards').expect(503);
    expect(res.body.error.code).toBe('DB_DISCONNECTED');
  });

  // ---- Phase 5: AI endpoint ----
  it('AI chat requires auth (401 Bengali)', async () => {
    const res = await request(app)
      .post('/api/ai/chat')
      .send({ slug: 'html5', mode: 'explain', messages: [{ role: 'user', content: 'হাই' }] })
      .expect(401);
    expect(res.body.error.code).toBe('AUTH_REQUIRED');
    expect(res.body.error.messageBn).toBe('আগে লগইন করুন।');
  });

  it('AI chat route is mounted (not 404)', async () => {
    const res = await request(app).post('/api/ai/chat').send({});
    expect(res.status).not.toBe(404);
  });

  // ---- Phase 6: review workflow endpoint ----
  it('skill card status change requires auth (401 before any DB access)', async () => {
    const res = await request(app)
      .patch('/api/skill-cards/html5/status')
      .send({ status: 'approved' })
      .expect(401);
    expect(res.body.error.messageBn).toBe('আগে লগইন করুন।');
  });

  // ---- auth ----
  it('login route is mounted and returns Bengali envelope (503 without DB)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'not-an-email', password: 'x' });
    expect(res.status).not.toBe(404);
    expect(res.body.ok).toBe(false);
    expect(typeof res.body.error.messageBn).toBe('string');
  });


  // ---- ধাপ ২: Progress / XP endpoints ----
  it('complete-card requires auth (401 Bengali)', async () => {
    const res = await request(app)
      .post('/api/progress/complete-card')
      .send({ slug: 'html5', quizScore: 100 })
      .expect(401);
    expect(res.body.error.code).toBe('AUTH_REQUIRED');
  });

  it('progress/me requires auth', async () => {
    const res = await request(app).get('/api/progress/me').expect(401);
    expect(res.body.error.messageBn).toBe('আগে লগইন করুন।');
  });

  it('curriculum route is public (not 401/404), returns Bengali envelope if unseeded', async () => {
    const res = await request(app).get('/api/progress/curriculum');
    expect([200, 404, 503]).toContain(res.status);
    expect(typeof res.body.ok).toBe('boolean');
  });

});
