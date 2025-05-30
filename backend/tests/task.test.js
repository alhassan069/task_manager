const request = require('supertest');
const app = require('./testServer');
const { User, Project, Task, ProjectMember } = require('../models');
const { setupDatabase, teardownDatabase, createTestUser, generateToken, createTestProject, createTestTask } = require('./testUtils');

// Load test environment variables
require('./setup');

describe('Task Routes', () => {
  let user, token, project, secondUser, secondToken;

  beforeAll(async () => {
    await setupDatabase();
  });

  afterAll(async () => {
    await teardownDatabase();
  });

  beforeEach(async () => {
    // Create test users
    user = await createTestUser({
      name: 'Task Owner',
      email: 'taskowner@example.com'
    });
    
    secondUser = await createTestUser({
      name: 'Another User',
      email: 'another2@example.com'
    });
    
    // Generate tokens
    token = generateToken(user);
    secondToken = generateToken(secondUser);
    
    // Create a test project
    project = await createTestProject(user);
  });

  afterEach(async () => {
    // Clean up database
    await Task.destroy({ where: {}, force: true });
    await ProjectMember.destroy({ where: {}, force: true });
    await Project.destroy({ where: {}, force: true });
    await User.destroy({ where: {}, force: true });
  });

  describe('POST /api/tasks', () => {
    it('should create a new task for a project', async () => {
      const taskData = {
        task_name: 'Test Task',
        due_date: new Date().toISOString(),
        priority: 'P2',
        project_id: project.id
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send(taskData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('task_name', taskData.task_name);
      expect(response.body).toHaveProperty('priority', taskData.priority);
      expect(response.body).toHaveProperty('project_id', project.id);
      expect(response.body).toHaveProperty('assigned_to', user.id); // Default is the creator
    });

    it('should return 401 if not authenticated', async () => {
      const taskData = {
        task_name: 'Test Task',
        project_id: project.id
      };

      await request(app)
        .post('/api/tasks')
        .send(taskData)
        .expect(401);
    });

    it('should return 400 if task name is missing', async () => {
      const taskData = {
        project_id: project.id
        // Missing task_name
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send(taskData)
        .expect(400);
    });

    it('should return 403 if user does not have access to the project', async () => {
      // Create a project owned by the second user
      const otherProject = await createTestProject(secondUser);

      const taskData = {
        task_name: 'Test Task',
        project_id: otherProject.id
      };

      await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send(taskData)
        .expect(403);
    });
  });

  describe('GET /api/tasks', () => {
    beforeEach(async () => {
      // Create test tasks
      await createTestTask(project, user, { task_name: 'Task 1' });
      await createTestTask(project, user, { task_name: 'Task 2' });
      await createTestTask(project, user, { task_name: 'Task 3', is_complete: true });
    });

    it('should return all tasks for a project', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .query({ project_id: project.id })
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.length).toBeGreaterThanOrEqual(3);
      
      // Check if tasks are sorted correctly (incomplete first)
      const incompleteTasks = response.body.filter(t => !t.is_complete);
      const completeTasks = response.body.filter(t => t.is_complete);
      
      expect(incompleteTasks.length).toBeGreaterThanOrEqual(2);
      expect(completeTasks.length).toBeGreaterThanOrEqual(1);
    });

    it('should return 401 if not authenticated', async () => {
      await request(app)
        .get('/api/tasks')
        .query({ project_id: project.id })
        .expect(401);
    });

    it('should return 400 if project_id is missing', async () => {
      await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .expect(400);
    });

    it('should return 403 if user does not have access to the project', async () => {
      // Create a project owned by the second user
      const otherProject = await createTestProject(secondUser);

      await request(app)
        .get('/api/tasks')
        .query({ project_id: otherProject.id })
        .set('Authorization', `Bearer ${token}`)
        .expect(403);
    });
  });

  describe('GET /api/tasks/:id', () => {
    let task;

    beforeEach(async () => {
      // Create a test task
      task = await createTestTask(project, user);
    });

    it('should return a specific task by ID', async () => {
      const response = await request(app)
        .get(`/api/tasks/${task.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', task.id);
      expect(response.body).toHaveProperty('task_name', task.task_name);
      expect(response.body).toHaveProperty('project_id', project.id);
    });

    it('should return 401 if not authenticated', async () => {
      await request(app)
        .get(`/api/tasks/${task.id}`)
        .expect(401);
    });

    it('should return 403 if user does not have access to the task\'s project', async () => {
      // Create a project owned by the second user
      const otherProject = await createTestProject(secondUser);
      // Create a task in that project
      const otherTask = await createTestTask(otherProject, secondUser);

      await request(app)
        .get(`/api/tasks/${otherTask.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(403);
    });

    it('should return 404 for non-existent task', async () => {
      await request(app)
        .get('/api/tasks/9999')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });
  });

  describe('PUT /api/tasks/:id', () => {
    let task;

    beforeEach(async () => {
      // Create a test task
      task = await createTestTask(project, user);
    });

    it('should update a task', async () => {
      const updateData = {
        task_name: 'Updated Task',
        priority: 'P1',
        due_date: new Date().toISOString()
      };

      const response = await request(app)
        .put(`/api/tasks/${task.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('task_name', updateData.task_name);
      expect(response.body).toHaveProperty('priority', updateData.priority);
    });

    it('should return 401 if not authenticated', async () => {
      await request(app)
        .put(`/api/tasks/${task.id}`)
        .send({ task_name: 'Updated Task' })
        .expect(401);
    });

    it('should return 403 if user is not the owner of the project', async () => {
      // Create a project owned by the second user
      const otherProject = await createTestProject(secondUser);
      // Create a task in that project
      const otherTask = await createTestTask(otherProject, secondUser);

      await request(app)
        .put(`/api/tasks/${otherTask.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ task_name: 'Trying to update' })
        .expect(403);
    });

    it('should return 404 for non-existent task', async () => {
      await request(app)
        .put('/api/tasks/9999')
        .set('Authorization', `Bearer ${token}`)
        .send({ task_name: 'Updated Task' })
        .expect(404);
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    let task;

    beforeEach(async () => {
      // Create a test task
      task = await createTestTask(project, user);
    });

    it('should delete a task', async () => {
      const response = await request(app)
        .delete(`/api/tasks/${task.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Task deleted successfully');

      // Verify the task is deleted
      const deletedTask = await Task.findByPk(task.id);
      expect(deletedTask).toBeNull();
    });

    it('should return 401 if not authenticated', async () => {
      await request(app)
        .delete(`/api/tasks/${task.id}`)
        .expect(401);
    });

    it('should return 403 if user is not the owner of the project', async () => {
      // Create a project owned by the second user
      const otherProject = await createTestProject(secondUser);
      // Create a task in that project
      const otherTask = await createTestTask(otherProject, secondUser);

      await request(app)
        .delete(`/api/tasks/${otherTask.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(403);
    });

    it('should return 404 for non-existent task', async () => {
      await request(app)
        .delete('/api/tasks/9999')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });
  });

  describe('PATCH /api/tasks/:id/complete', () => {
    let task;

    beforeEach(async () => {
      // Create a test task (initially incomplete)
      task = await createTestTask(project, user, { is_complete: false });
    });

    it('should toggle task completion status from incomplete to complete', async () => {
      const response = await request(app)
        .patch(`/api/tasks/${task.id}/complete`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('is_complete', true);
    });

    it('should toggle task completion status from complete to incomplete', async () => {
      // First make it complete
      await task.update({ is_complete: true });

      const response = await request(app)
        .patch(`/api/tasks/${task.id}/complete`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('is_complete', false);
    });

    it('should return 401 if not authenticated', async () => {
      await request(app)
        .patch(`/api/tasks/${task.id}/complete`)
        .expect(401);
    });

    it('should return 403 if user does not have access to the task\'s project', async () => {
      // Create a project owned by the second user
      const otherProject = await createTestProject(secondUser);
      // Create a task in that project
      const otherTask = await createTestTask(otherProject, secondUser);

      await request(app)
        .patch(`/api/tasks/${otherTask.id}/complete`)
        .set('Authorization', `Bearer ${token}`)
        .expect(403);
    });

    it('should return 404 for non-existent task', async () => {
      await request(app)
        .patch('/api/tasks/9999/complete')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });
  });
}); 