const { Project, User, ProjectMember } = require('../models');

// Create a new project
const createProject = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!name) {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: ['Project name is required'] 
      });
    }

    const project = await Project.create({
      name,
      description,
      owner_id: userId,
    });

    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
};

// Get all projects for the current user
const getUserProjects = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get projects owned by the user
    const ownedProjects = await Project.findAll({
      where: { owner_id: userId },
      order: [['created_at', 'DESC']],
    });

    // Get projects shared with the user
    const sharedProjects = await Project.findAll({
      include: [
        {
          model: User,
          as: 'members',
          where: { id: userId },
          through: { attributes: [] },
        },
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email'],
        },
      ],
      order: [['created_at', 'DESC']],
    });

    // Combine and format the results
    const projects = [
      ...ownedProjects.map(project => ({
        ...project.get({ plain: true }),
        isOwner: true,
      })),
      ...sharedProjects.map(project => ({
        ...project.get({ plain: true }),
        isOwner: false,
      })),
    ];

    res.json(projects);
  } catch (error) {
    next(error);
  }
};

// Get a specific project by ID
const getProjectById = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;

    const project = await Project.findByPk(projectId, {
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: User,
          as: 'members',
          attributes: ['id', 'name', 'email'],
          through: { attributes: [] },
        },
      ],
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is owner or member
    const isOwner = project.owner_id === userId;
    const isMember = project.members.some(member => member.id === userId);

    if (!isOwner && !isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({
      ...project.get({ plain: true }),
      isOwner,
    });
  } catch (error) {
    next(error);
  }
};

// Update a project
const updateProject = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;
    const { name, description } = req.body;

    const project = await Project.findByPk(projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Only the owner can update a project
    if (project.owner_id !== userId) {
      return res.status(403).json({ message: 'Only the owner can update the project' });
    }

    // Update project
    await project.update({ name, description });

    res.json(project);
  } catch (error) {
    next(error);
  }
};

// Delete a project
const deleteProject = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;

    const project = await Project.findByPk(projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Only the owner can delete a project
    if (project.owner_id !== userId) {
      return res.status(403).json({ message: 'Only the owner can delete the project' });
    }

    // Delete project
    await project.destroy();

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Share project with a user
const shareProject = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;
    const { email } = req.body;

    // Find project
    const project = await Project.findByPk(projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is the owner
    if (project.owner_id !== userId) {
      return res.status(403).json({ message: 'Only the owner can share the project' });
    }

    // Find user to share with
    const userToShare = await User.findOne({ where: { email } });

    if (!userToShare) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already shared
    const existingShare = await ProjectMember.findOne({
      where: {
        project_id: projectId,
        user_id: userToShare.id,
      },
    });

    if (existingShare) {
      return res.status(400).json({ message: 'Project already shared with this user' });
    }

    // Share project
    await ProjectMember.create({
      project_id: projectId,
      user_id: userToShare.id,
    });

    res.json({ message: 'Project shared successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProject,
  getUserProjects,
  getProjectById,
  updateProject,
  deleteProject,
  shareProject,
}; 