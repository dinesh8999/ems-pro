import request from 'supertest';
import app from '../server.js';

describe('Health endpoint', () => {
  test('GET /api/health returns 200 and success true', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('message');
  });
});
