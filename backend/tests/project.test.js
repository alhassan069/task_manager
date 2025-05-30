const request = require('supertest');
const app = require('./testServer');
const { User, Project, ProjectMember } = require('../models');
const { setupDatabase, teardownDatabase, createTestUser, generateToken } = require('./testUtils');

// Load test environment variables
require('./setup');

describe('Project Routes', () => {
  let user, token, secondUser, secondToken;

  beforeAll(async () => {
    await setupDatabase();
  });

  afterAll(async () => {
    await teardownDatabase();
  });

  beforeEach(async () => {
    // Create test users
    user = await createTestUser({
      name: 'Project Owner',
      email: 'owner@example.com'
    });
    
    secondUser = await createTestUser({
      name: 'Another User',
      email: 'another@example.com'
    });
    
    // Generate tokens
    token = generateToken(user);
    secondToken = generateToken(secondUser);
  });

  afterEach(async () => {
    // Clean up database
    await ProjectMember.destroy({ where: {}, force: true });
    await Project.destroy({ where: {}, force: true });
    await User.destroy({ where: {}, force: true });
  });

  describe('POST /api/projects', () => {
    it('should create a new project for authenticated user', async () => {
      const projectData = {
        name: 'Test Project',
        description: 'A test project description'
      };

      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${token}`)
        .send(projectData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name', projectData.name);
      expect(response.body).toHaveProperty('description', projectData.description);
      expect(response.body).toHaveProperty('owner_id', user.id);
    });

    it('should return 401 if not authenticated', async () => {
      const projectData = {
        name: 'Test Project',
        description: 'A test project description'
      };

      await request(app)
        .post('/api/projects')
        .send(projectData)
        .expect(401);
    });

    it('should return 400 if project name is missing', async () => {
      const projectData = {
        description: 'A test project description'
        // Missing name
      };

      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${token}`)
        .send(projectData)
        .expect(400);
    });
  });

  describe('GET /api/projects', () => {
    beforeEach(async () => {
      // Create test projects
      await Project.create({
        name: 'Project 1',
        description: 'Project 1 description',
        owner_id: user.id
      });

      await Project.create({
        name: 'Project 2',
        description: 'Project 2 description',
        owner_id: user.id
      });

      // Create a project owned by the second user and shared with the first user
      const sharedProject = await Project.create({
        name: 'Shared Project',
        description: 'A shared project',
        owner_id: secondUser.id
      });

      // Add first user as a member
      await ProjectMember.create({
        project_id: sharedProject.id,
        user_id: user.id
      });
    });

    it('should return all projects for the authenticated user', async () => {
      const response = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Should return 3 projects (2 owned + 1 shared)
      expect(response.body.length).toBeGreaterThanOrEqual(3);
      
      // Check if we have both owned and shared projects
      const ownedProjects = response.body.filter(p => p.isOwner);
      const sharedProjects = response.body.filter(p => !p.isOwner);
      
      expect(ownedProjects.length).toBeGreaterThanOrEqual(2);
      expect(sharedProjects.length).toBeGreaterThanOrEqual(1);
    });

    it('should return 401 if not authenticated', async () => {
      await request(app)
        .get('/api/projects')
        .expect(401);
    });
  });

  describe('GET /api/projects/:id', () => {
    let project;

    beforeEach(async () => {
      // Create a test project
      project = await Project.create({
        name: 'Test Project',
        description: 'Test Project description',
        owner_id: user.id
      });
    });

    it('should return a specific project by ID', async () => {
      const response = await request(app)
        .get(`/api/projects/${project.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', project.id);
      expect(response.body).toHaveProperty('name', project.name);
      expect(response.body).toHaveProperty('description', project.description);
      expect(response.body).toHaveProperty('isOwner', true);
    });

    it('should return 401 if not authenticated', async () => {
      await request(app)
        .get(`/api/projects/${project.id}`)
        .expect(401);
    });

    it('should return 403 if user does not have access to the project', async () => {
      // Create a project owned by the second user
      const otherProject = await Project.create({
        name: 'Other Project',
        description: 'Not accessible',
        owner_id: secondUser.id
      });

      await request(app)
        .get(`/api/projects/${otherProject.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(403);
    });

    it('should return 404 for non-existent project', async () => {
      await request(app)
        .get('/api/projects/9999')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });
  });

  describe('PUT /api/projects/:id', () => {
    let project;

    beforeEach(async () => {
      // Create a test project
      project = await Project.create({
        name: 'Test Project',
        description: 'Test Project description',
        owner_id: user.id
      });
    });

    it('should update a project', async () => {
      const updateData = {
        name: 'Updated Project',
        description: 'Updated description'
      };

      const response = await request(app)
        .put(`/api/projects/${project.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('name', updateData.name);
      expect(response.body).toHaveProperty('description', updateData.description);
    });

    it('should return 401 if not authenticated', async () => {
      await request(app)
        .put(`/api/projects/${project.id}`)
        .send({ name: 'Updated Project' })
        .expect(401);
    });

    it('should return 403 if user is not the owner', async () => {
      // Create a project owned by the second user
      const otherProject = await Project.create({
        name: 'Other Project',
        description: 'Not accessible',
        owner_id: secondUser.id
      });

      // Add first user as a member
      await ProjectMember.create({
        project_id: otherProject.id,
        user_id: user.id
      });

      // First user tries to update second user's project
      await request(app)
        .put(`/api/projects/${otherProject.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Trying to update' })
        .expect(403);
    });

    it('should return 404 for non-existent project', async () => {
      await request(app)
        .put('/api/projects/9999')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Updated Project' })
        .expect(404);
    });
  });

  describe('DELETE /api/projects/:id', () => {
    let project;

    beforeEach(async () => {
      // Create a test project
      project = await Project.create({
        name: 'Test Project',
        description: 'Test Project description',
        owner_id: user.id
      });
    });

    it('should delete a project', async () => {
      const response = await request(app)
        .delete(`/api/projects/${project.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Project deleted successfully');

      // Verify the project is deleted
      const deletedProject = await Project.findByPk(project.id);
      expect(deletedProject).toBeNull();
    });

    it('should return 401 if not authenticated', async () => {
      await request(app)
        .delete(`/api/projects/${project.id}`)
        .expect(401);
    });

    it('should return 403 if user is not the owner', async () => {
      // Create a project owned by the second user
      const otherProject = await Project.create({
        name: 'Other Project',
        description: 'Not accessible',
        owner_id: secondUser.id
      });

      // Add first user as a member
      await ProjectMember.create({
        project_id: otherProject.id,
        user_id: user.id
      });

      // First user tries to delete second user's project
      await request(app)
        .delete(`/api/projects/${otherProject.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(403);
    });

    it('should return 404 for non-existent project', async () => {
      await request(app)
        .delete('/api/projects/9999')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });
  });

  describe('POST /api/projects/:id/share', () => {
    let project;

    beforeEach(async () => {
      // Create a test project
      project = await Project.create({
        name: 'Test Project',
        description: 'Test Project description',
        owner_id: user.id
      });
    });

    it('should share a project with another user', async () => {
      const response = await request(app)
        .post(`/api/projects/${project.id}/share`)
        .set('Authorization', `Bearer ${token}`)
        .send({ email: secondUser.email })
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Project shared successfully');

      // Verify the project is shared
      const membership = await ProjectMember.findOne({
        where: {
          project_id: project.id,
          user_id: secondUser.id
        }
      });
      expect(membership).not.toBeNull();
    });

    it('should return 401 if not authenticated', async () => {
      await request(app)
        .post(`/api/projects/${project.id}/share`)
        .send({ email: secondUser.email })
        .expect(401);
    });

    it('should return 403 if user is not the owner', async () => {
      // Create a project owned by the second user
      const otherProject = await Project.create({
        name: 'Other Project',
        description: 'Not accessible',
        owner_id: secondUser.id
      });

      // First user tries to share second user's project
      await request(app)
        .post(`/api/projects/${otherProject.id}/share`)
        .set('Authorization', `Bearer ${token}`)
        .send({ email: 'test@example.com' })
        .expect(403);
    });

    it('should return 404 for non-existent project', async () => {
      await request(app)
        .post('/api/projects/9999/share')
        .set('Authorization', `Bearer ${token}`)
        .send({ email: secondUser.email })
        .expect(404);
    });

    it('should return 404 if the user to share with does not exist', async () => {
      const response = await request(app)
        .post(`/api/projects/${project.id}/share`)
        .set('Authorization', `Bearer ${token}`)
        .send({ email: 'nonexistent@example.com' })
        .expect(404);

      expect(response.body).toHaveProperty('message', 'User not found');
    });

    it('should return 400 if the project is already shared with the user', async () => {
      // Share the project first
      await ProjectMember.create({
        project_id: project.id,
        user_id: secondUser.id
      });

      // Try to share again
      const response = await request(app)
        .post(`/api/projects/${project.id}/share`)
        .set('Authorization', `Bearer ${token}`)
        .send({ email: secondUser.email })
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Project already shared with this user');
    });
  });
}); 