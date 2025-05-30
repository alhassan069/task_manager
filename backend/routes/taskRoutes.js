const express = require('express');
const router = express.Router();
const {
  createTask,
  getProjectTasks,
  getTaskById,
  updateTask,
  deleteTask,
  toggleTaskCompletion,
} = require('../controllers/taskController');
const { authenticate } = require('../middlewares/authMiddleware');

// Apply authentication middleware to all task routes
router.use(authenticate);

// Create a new task
router.post('/', createTask);

// Get all tasks for a project
router.get('/', getProjectTasks);

// Get a specific task by ID
router.get('/:id', getTaskById);

// Update a task
router.put('/:id', updateTask);

// Delete a task
router.delete('/:id', deleteTask);

// Toggle task completion status
router.patch('/:id/complete', toggleTaskCompletion);

module.exports = router; 