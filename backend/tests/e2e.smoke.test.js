import request from 'supertest';
import app from '../server.js';

let token;

describe('E2E smoke', () => {
  it('GET /api/health', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('POST /api/auth/login and access protected analytics', async () => {
    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@ems.com', password: 'admin123' });

    expect(login.status).toBe(200);
    expect(login.body.success).toBe(true);
    token = login.body.token;
    expect(token).toBeDefined();

    const analytics = await request(app)
      .get('/api/analytics')
      .set('Authorization', `Bearer ${token}`);

    expect(analytics.status).toBe(200);
    expect(analytics.body.success).toBe(true);
    expect(analytics.body.data).toBeDefined();
  }, 10000);
});
