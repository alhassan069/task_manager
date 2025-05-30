const { Task, Project, User, ProjectMember } = require('../models');
const { Op } = require('sequelize');

// Check if user has access to a project
const hasProjectAccess = async (projectId, userId) => {
  const project = await Project.findByPk(projectId);
  
  if (!project) {
    return false;
  }
  
  // Check if user is the owner
  if (project.owner_id === userId) {
    return { hasAccess: true, isOwner: true };
  }
  
  // Check if user is a member
  const membership = await ProjectMember.findOne({
    where: {
      project_id: projectId,
      user_id: userId,
    },
  });
  
  return { hasAccess: !!membership, isOwner: false };
};

// Create a new task
const createTask = async (req, res, next) => {
  try {
    const { task_name, due_date, priority, project_id } = req.body;
    const userId = req.user.id;
    
    // Validate required fields
    if (!task_name || !project_id) {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: ['Task name and project ID are required'] 
      });
    }
    
    // Check if user has access to the project
    const { hasAccess, isOwner } = await hasProjectAccess(project_id, userId);
    
    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied to this project' });
    }
    
    // Only project owner can create tasks for now (Phase 1)
    if (!isOwner) {
      return res.status(403).json({ message: 'Only the project owner can create tasks' });
    }
    
    const task = await Task.create({
      task_name,
      assigned_to: userId, // Assign to self by default in Phase 1
      due_date: due_date || null,
      priority: priority || 'P3',
      is_complete: false,
      project_id,
    });
    
    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

// Get all tasks for a project
const getProjectTasks = async (req, res, next) => {
  try {
    const { project_id } = req.query;
    const userId = req.user.id;
    
    if (!project_id) {
      return res.status(400).json({ message: 'Project ID is required' });
    }
    
    // Check if user has access to the project
    const { hasAccess } = await hasProjectAccess(project_id, userId);
    
    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied to this project' });
    }
    
    const tasks = await Task.findAll({
      where: { project_id },
      include: [
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'name', 'email'],
        },
      ],
      order: [
        ['is_complete', 'ASC'],
        ['due_date', 'ASC'],
        ['created_at', 'DESC'],
      ],
    });
    
    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

// Get a specific task by ID
const getTaskById = async (req, res, next) => {
  try {
    const taskId = req.params.id;
    const userId = req.user.id;
    
    const task = await Task.findByPk(taskId, {
      include: [
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name', 'owner_id'],
        },
      ],
    });
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Check if user has access to the project
    const { hasAccess } = await hasProjectAccess(task.project_id, userId);
    
    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied to this task' });
    }
    
    res.json(task);
  } catch (error) {
    next(error);
  }
};

// Update a task
const updateTask = async (req, res, next) => {
  try {
    const taskId = req.params.id;
    const userId = req.user.id;
    const { task_name, assigned_to, due_date, priority, is_complete } = req.body;
    
    const task = await Task.findByPk(taskId, {
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name', 'owner_id'],
        },
      ],
    });
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Check if user has access to the project
    const { hasAccess, isOwner } = await hasProjectAccess(task.project_id, userId);
    
    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied to this task' });
    }
    
    // In Phase 1, only the project owner can update tasks
    if (!isOwner) {
      return res.status(403).json({ message: 'Only the project owner can update tasks' });
    }
    
    // Update task
    await task.update({
      task_name: task_name || task.task_name,
      assigned_to: assigned_to || task.assigned_to,
      due_date: due_date !== undefined ? due_date : task.due_date,
      priority: priority || task.priority,
      is_complete: is_complete !== undefined ? is_complete : task.is_complete,
    });
    
    // Reload task with associations
    await task.reload({
      include: [
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });
    
    res.json(task);
  } catch (error) {
    next(error);
  }
};

// Delete a task
const deleteTask = async (req, res, next) => {
  try {
    const taskId = req.params.id;
    const userId = req.user.id;
    
    const task = await Task.findByPk(taskId, {
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name', 'owner_id'],
        },
      ],
    });
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Check if user has access to the project
    const { hasAccess, isOwner } = await hasProjectAccess(task.project_id, userId);
    
    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied to this task' });
    }
    
    // In Phase 1, only the project owner can delete tasks
    if (!isOwner) {
      return res.status(403).json({ message: 'Only the project owner can delete tasks' });
    }
    
    // Delete task
    await task.destroy();
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Mark a task as complete or incomplete
const toggleTaskCompletion = async (req, res, next) => {
  try {
    const taskId = req.params.id;
    const userId = req.user.id;
    
    const task = await Task.findByPk(taskId, {
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name', 'owner_id'],
        },
      ],
    });
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Check if user has access to the project
    const { hasAccess } = await hasProjectAccess(task.project_id, userId);
    
    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied to this task' });
    }
    
    // Update task completion status
    await task.update({
      is_complete: !task.is_complete,
    });
    
    // Reload task with associations
    await task.reload({
      include: [
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });
    
    res.json(task);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTask,
  getProjectTasks,
  getTaskById,
  updateTask,
  deleteTask,
  toggleTaskCompletion,
}; 