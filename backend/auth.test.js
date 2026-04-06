const request = require('supertest');
const app = require('./app');

// 1. Generate a unique ID once when the test suite starts
const uniqueId = Date.now(); 
const testUsername = `mzansicoder_${uniqueId}`;
const testEmail = `coder_${uniqueId}@mzansi.com`;

describe('Authentication API', () => {
  
  it('should register a new developer securely and return a token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: testUsername,
        email: testEmail,
        password: 'Password123!'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('username', testUsername);
    expect(res.body.user).not.toHaveProperty('password_hash'); 
  });

  it('should log in an existing developer and return a token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testEmail,
        password: 'Password123!'    
      });

    expect(res.statusCode).toBe(200); 
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('email', testEmail);
    expect(res.body.user).not.toHaveProperty('password_hash');
  });

});