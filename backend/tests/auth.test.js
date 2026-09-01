import request from 'supertest';
import app from '../server.js';

describe('Auth API', () => {
  it('should signup a new admin and return token', async () => {
    const unique = Date.now();
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ username: `testadmin${unique}`, email: `testadmin${unique}@ems.com`, password: 'testpass' });

    expect([200,201]).toContain(res.status);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
  });

  it('should login existing admin and verify token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@ems.com', password: 'admin123' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();

    const verify = await request(app)
      .get('/api/auth/verify')
      .set('Authorization', `Bearer ${res.body.token}`);

    expect(verify.status).toBe(200);
    expect(verify.body.success).toBe(true);
    expect(verify.body.admin).toBeDefined();
  });
});
