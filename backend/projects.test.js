const request = require('supertest');
const app = require('./app');

describe('Projects API', () => {
  let validToken = '';

  beforeAll(async () => {
    const uniqueId = Date.now();
    const testUsername = `projectdev_${uniqueId}`;
    const testEmail = `projectdev_${uniqueId}@mzansi.com`;

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: testUsername,
        email: testEmail,
        password: 'Password123!'
      });

    validToken = res.body.token;
  });

  it('should block anonymous users from creating a project', async () => {
    const res = await request(app)
      .post('/api/projects')
      .send({ title: 'Anonymous Hack', tech_stack: 'Malware' });
    expect(res.statusCode).toBe(401);
  });

  it('should reject a project missing required fields', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ tech_stack: 'React' });
    expect(res.statusCode).toBe(400);
  });

  it('should allow an authenticated developer to post a new project', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${validToken}`)
      .send({
        title: 'Recipe App',
        description: 'Sharing recipes.',
        tech_stack: 'Android Studio'
      });
    expect(res.statusCode).toBe(201);
  });

  it('should fetch a list of all public projects', async () => {
    const res = await request(app).get('/api/projects');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.projects)).toBeTruthy();
  });

  it('should allow the owner to update their project', async () => {
    const postRes = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ title: 'Temp', tech_stack: 'Node' });
    
    const projectId = postRes.body.project.id;
    const updateRes = await request(app)
      .put(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${validToken}`)
      .send({ title: 'Updated', tech_stack: 'Express', status: 'In Progress' });

    expect(updateRes.statusCode).toBe(200);
  });

  it('should allow the owner to delete their project', async () => {
    const postRes = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ title: 'Delete', tech_stack: 'Python' });
    
    const projectId = postRes.body.project.id;
    const deleteRes = await request(app)
      .delete(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${validToken}`);
    expect(deleteRes.statusCode).toBe(200);
  });


  describe('Milestones API', () => {
    let testProjectId;

    it('should setup a project for milestone testing', async () => {
      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ title: 'Milestone Test', tech_stack: 'React' });
      testProjectId = res.body.project.id;
      expect(res.statusCode).toBe(201);
    });

    it('should allow the owner to add a milestone', async () => {
      const res = await request(app)
        .post(`/api/projects/${testProjectId}/milestones`)
        .set('Authorization', `Bearer ${validToken}`)
        .send({ title: 'Design Done', status: 'Completed' });
      expect(res.statusCode).toBe(201);
    });

    it('should block milestones missing fields', async () => {
      const res = await request(app)
        .post(`/api/projects/${testProjectId}/milestones`)
        .set('Authorization', `Bearer ${validToken}`)
        .send({ description: 'No title!' });
      expect(res.statusCode).toBe(400);
    });

    it('should publicly fetch all milestones', async () => {
      const res = await request(app).get(`/api/projects/${testProjectId}/milestones`);
      expect(res.statusCode).toBe(200);
    });
  });

  describe('Discussions API', () => {
    let testProjectId;

    it('should setup a project for discussion testing', async () => {
      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ title: 'Discussion Test', tech_stack: 'NodeJS' });
      testProjectId = res.body.project.id;
      expect(res.statusCode).toBe(201);
    });

    it('should allow a user to post a QUESTION', async () => {
      const res = await request(app)
        .post(`/api/projects/${testProjectId}/discussions`)
        .set('Authorization', `Bearer ${validToken}`)
        .send({ content: 'Help?', type: 'QUESTION' });
      expect(res.statusCode).toBe(201);
    });

    it('should allow a user to post a COMMENT', async () => {
      const res = await request(app)
        .post(`/api/projects/${testProjectId}/discussions`)
        .set('Authorization', `Bearer ${validToken}`)
        .send({ content: 'Cool!', type: 'COMMENT' });
      expect(res.statusCode).toBe(201);
    });

    it('should fetch discussions with author username', async () => {
      const res = await request(app).get(`/api/projects/${testProjectId}/discussions`);
      expect(res.statusCode).toBe(200);
      expect(res.body.discussions[0]).toHaveProperty('users');
    });

    it('should block a discussion post without a token', async () => {
      const res = await request(app)
        .post(`/api/projects/${testProjectId}/discussions`)
        .send({ content: 'Anon', type: 'COMMENT' });
      expect(res.statusCode).toBe(401);
    });
  });


  describe('Celebration Wall', () => {
    it('should fetch only completed projects and include the author username', async () => {
      // Setup: Create a project that is already 'Completed'
      await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ 
          title: 'Finished Project', 
          tech_stack: 'Vue.js',
          status: 'Completed' 
        });

      const res = await request(app).get('/api/projects/celebrations');
      
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.projects)).toBeTruthy();
      
      res.body.projects.forEach(project => {
        expect(project.status).toBe('Completed');
      });

      //Join Check: Ensure the users object (username) is there
      if (res.body.projects.length > 0) {
        expect(res.body.projects[0]).toHaveProperty('users');
        expect(res.body.projects[0].users).toHaveProperty('username');
      }
    });
  });

});