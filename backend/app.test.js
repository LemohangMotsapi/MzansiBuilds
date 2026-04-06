const request = require('supertest');
const app = require('./app');
const expectCookies = require('supertest/lib/cookies');

describe('Server Initialisation & Security', () =>{
    it('should return a 200 Ok status and a welcome message', async() =>{
        const response = await request(app).get('/');
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('MzansiBuilds API is running securely');
    });

    it('should have a security headers(Helmet)' , async() =>{
        const response = await request(app).get('/');
        expect(response.headers['x-powered-by']).toBeUndefined();
    });
});