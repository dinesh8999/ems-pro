import request from 'supertest';
import app from '../server.js';

let adminToken;
let createdEmployeeId;

beforeAll(async () => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@ems.com', password: 'admin123' });
  adminToken = res.body.token;
});

describe('Employees API', () => {
  it('should create a new employee', async () => {
    const res = await request(app)
      .post('/api/employees')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Test Employee', email: `test.emp.${Date.now()}@ems.com`, department: 'Other', position: 'Tester', salary: 50000 });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    createdEmployeeId = res.body.data._id;
  });

  it('should fetch employees and include created one', async () => {
    const res = await request(app)
      .get('/api/employees')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    const found = res.body.data.find(e => e._id === createdEmployeeId);
    expect(found).toBeDefined();
  });

  it('should update the employee profile', async () => {
    const res = await request(app)
      .put(`/api/employees/${createdEmployeeId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Updated Name', phone: '1234567890' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Updated Name');
  });

  it('should delete the employee', async () => {
    const res = await request(app)
      .delete(`/api/employees/${createdEmployeeId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
