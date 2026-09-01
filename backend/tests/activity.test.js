import request from 'supertest';
import app from '../server.js';

let token;
let createdId;

beforeAll(async () => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@ems.com', password: 'admin123' });
  token = res.body.token;
});

describe('Activity endpoints', () => {
  it('POST /api/activity should create an activity', async () => {
    const res = await request(app)
      .post('/api/activity')
      .set('Authorization', `Bearer ${token}`)
      .send({ action: 'Test action', entityType: 'Auth', details: 'testing' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    createdId = res.body.data._id;
  });

  it('GET /api/activity/recent should include the created activity', async () => {
    const res = await request(app)
      .get('/api/activity/recent')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const found = res.body.data.find(a => a._id === createdId);
    expect(found).toBeDefined();
  });

  it('DELETE /api/activity/:id should delete the activity (admin)', async () => {
    const res = await request(app)
      .delete(`/api/activity/${createdId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
