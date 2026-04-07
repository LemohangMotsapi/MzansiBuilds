const request = require('supertest');
const app = require('./app');

describe('Projects API', () => {
  
  // We need a variable to hold the VIP pass
  let validToken = '';

  // Setup: Register a brand new dynamic user BEFORE the tests run
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
      .send({
        title: 'Anonymous Hack',
        tech_stack: 'Malware'
      });


    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('should reject a project missing required fields', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${validToken}`)
      .send({
        // Missing the required 'title' field!
        tech_stack: 'React, Node'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });


  it('should allow an authenticated developer to post a new project', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${validToken}`)
      .send({
        title: 'Recipe Sharing Mobile App',
        description: 'A mobile application where food enthusiasts can share and find recipes.',
        tech_stack: 'Android Studio, Java'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.project).toHaveProperty('title', 'Recipe Sharing Mobile App');
    expect(res.body.project).toHaveProperty('user_id'); // This proves the middleware extracted the ID!
  });


  it('should fetch a list of all public projects', async () =>{
    const res = await request(app)
        .get('/api/projects');
        
        //console.log("Here is the raw data:", res.body.projects);
        //console.log("Total Projects Found:", res.body.projects.length);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.projects)).toBeTruthy();
        expect(res.body.projects.length).toBeGreaterThan(0);
  });

  it('should allow the owner to update their project', async () => {
    const postRes = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ title: 'Temporary Title', tech_stack: 'Node.js' });
    
    const projectId = postRes.body.project.id;

    const updateRes = await request(app)
      .put(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${validToken}`)
      .send({ title: 'Updated Title', tech_stack: 'Node.js, Express' });

    expect(updateRes.statusCode).toBe(200);
    expect(updateRes.body.project.title).toBe('Updated Title');
  });

  it('should allow the owner to delete their project', async () => {
    const postRes = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ title: 'Project To Delete', tech_stack: 'Python' });
    
    const projectId = postRes.body.project.id;

    const deleteRes = await request(app)
      .delete(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${validToken}`);


    expect(deleteRes.statusCode).toBe(200);

    const fetchDeletedRes = await request(app)
      .get(`/api/projects/${projectId}`);
  });

  describe('Milestones API', () => {
    let testProjectId;

    it('should setup a project for milestone testing', async () => {
      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ title: 'Milestone Test Project', tech_stack: 'React' });
      
      testProjectId = res.body.project.id;
      expect(res.statusCode).toBe(201);
    });

    it('should allow the owner to add a milestone', async () => {
      const res = await request(app)
        .post(`/api/projects/${testProjectId}/milestones`)
        .set('Authorization', `Bearer ${validToken}`)
        .send({ title: 'System Architecture Designed', status: 'Completed' });
      
      expect(res.statusCode).toBe(201);
      expect(res.body.milestone.title).toBe('System Architecture Designed');
      expect(res.body.milestone.project_id).toBe(testProjectId);
    });

    it('should block milestones missing required fields', async () => {
      const res = await request(app)
        .post(`/api/projects/${testProjectId}/milestones`)
        .set('Authorization', `Bearer ${validToken}`)
        .send({ description: 'Forgot the title and status!' }); // Missing required fields
      
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Title and status are required');
    });

    it('should publicly fetch all milestones for a project', async () => {
      const res = await request(app)
        .get(`/api/projects/${testProjectId}/milestones`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.milestones.length).toBeGreaterThan(0);
      expect(res.body.milestones[0].title).toBe('System Architecture Designed');
    });
  });



});