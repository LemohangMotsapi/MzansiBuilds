const request = require('supertest');
const app = require('./app');

describe('Authentication API', () => {
  it('should register a new developer securely and return a token', async () => {
    const res = await request(app)

    // Sending fake http request 
      .post('/api/auth/register')
      .send({
        username: 'mzansicoder5',
        email: 'coder5@mzansi.com',
        password: 'Password123!'
      });

    expect(res.statusCode).toBe(201);
    
    expect(res.body).toHaveProperty('token');
    

    expect(res.body.user).toHaveProperty('username', 'mzansicoder5');
    expect(res.body.user).not.toHaveProperty('password_hash'); 
  });
});