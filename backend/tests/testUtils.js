const request = require('supertest');
const jwt = require('jsonwebtoken');
const { sequelize, User, Project, Task } = require('../models');

// Create a test user
const createTestUser = async (userData = {}) => {
  const defaultUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123'
  };

  const user = await User.create({ ...defaultUser, ...userData });
  return user;
};

// Generate a valid JWT token for a user
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

// Create a test project
const createTestProject = async (owner, projectData = {}) => {
  const defaultProject = {
    name: 'Test Project',
    description: 'A test project',
    owner_id: owner.id
  };

  const project = await Project.create({ ...defaultProject, ...projectData });
  return project;
};

// Create a test task
const createTestTask = async (project, assignee, taskData = {}) => {
  const defaultTask = {
    task_name: 'Test Task',
    project_id: project.id,
    assigned_to: assignee.id,
    priority: 'P3',
    is_complete: false
  };

  const task = await Task.create({ ...defaultTask, ...taskData });
  return task;
};

// Setup and teardown the database
const setupDatabase = async () => {
  await sequelize.sync({ force: true });
};

const teardownDatabase = async () => {
  await sequelize.close();
};

module.exports = {
  createTestUser,
  generateToken,
  createTestProject,
  createTestTask,
  setupDatabase,
  teardownDatabase
}; 