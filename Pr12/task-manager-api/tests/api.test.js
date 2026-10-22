const request = require('supertest');
const app = require('../server');

describe('Task Management REST API - CI/CD Automated Test Suite', () => {

  // Test 1: Public Debug Cache Endpoint
  test('GET /cache-stats returns 200 OK with cache statistics', async () => {
    const res = await request(app).get('/cache-stats');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('hits');
    expect(res.body).toHaveProperty('misses');
    expect(res.body).toHaveProperty('hitRatio');
  });

  // Test 2: Protected Route Authentication Enforcement
  test('GET /tasks without Authorization header returns 401 Unauthorized', async () => {
    const res = await request(app).get('/tasks');
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error', 'No token provided');
  });

  // Test 3: Input Validation on Registration
  test('POST /register with missing password returns 400 Bad Request', async () => {
    const res = await request(app)
      .post('/register')
      .send({ name: 'Het', email: 'het@example.com' });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/Validation failed/i);
  });

  // Test 4: Supplementary Problem 1 - Asynchronous EventEmitter Event Pipeline
  test('POST /trigger-event-error catches background errors safely', async () => {
    const res = await request(app)
      .post('/trigger-event-error')
      .send({});
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
  });

  // Test 5: Event Audit Trail Endpoint
  test('GET /event-logs returns 200 OK with event audit log array', async () => {
    const res = await request(app).get('/event-logs');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

});
