const express = require('express');
const router = express.Router();
const {
  createProject,
  getUserProjects,
  getProjectById,
  updateProject,
  deleteProject,
  shareProject,
} = require('../controllers/projectController');
const { authenticate } = require('../middlewares/authMiddleware');

// Apply authentication middleware to all project routes
router.use(authenticate);

// Create a new project
router.post('/', createProject);

// Get all projects for the current user
router.get('/', getUserProjects);

// Get a specific project by ID
router.get('/:id', getProjectById);

// Update a project
router.put('/:id', updateProject);

// Delete a project
router.delete('/:id', deleteProject);

// Share a project with another user
router.post('/:id/share', shareProject);

module.exports = router; 