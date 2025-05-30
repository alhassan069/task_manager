const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

// Determine which database to use based on environment
const isProduction = process.env.NODE_ENV === 'production';
const dbDialect = process.env.DB_DIALECT || 'sqlite';

let sequelize;

if (dbDialect === 'sqlite') {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: process.env.DB_STORAGE || './database.sqlite',
    logging: false
  });
} else if (dbDialect === 'postgres') {
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      dialect: 'postgres',
      logging: false,
      dialectOptions: {
        ssl: isProduction ? { require: true, rejectUnauthorized: false } : false
      }
    }
  );
}

// Initialize models
const User = require('./user')(sequelize);
const Project = require('./project')(sequelize);
const Task = require('./task')(sequelize);
const ProjectMember = require('./projectMember')(sequelize);

// Define associations
User.hasMany(Project, { foreignKey: 'owner_id', as: 'ownedProjects' });
Project.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });

Project.hasMany(Task, { foreignKey: 'project_id', as: 'tasks' });
Task.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });

User.hasMany(Task, { foreignKey: 'assigned_to', as: 'assignedTasks' });
Task.belongsTo(User, { foreignKey: 'assigned_to', as: 'assignee' });

// Project members (for sharing)
Project.belongsToMany(User, { through: ProjectMember, foreignKey: 'project_id', as: 'members' });
User.belongsToMany(Project, { through: ProjectMember, foreignKey: 'user_id', as: 'sharedProjects' });

module.exports = {
  sequelize,
  User,
  Project,
  Task,
  ProjectMember
}; 