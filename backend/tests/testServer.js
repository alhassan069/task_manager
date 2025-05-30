const express = require('express');
const cors = require('cors');
const { sequelize } = require('../models');

// Routes
const authRoutes = require('../routes/authRoutes');
const projectRoutes = require('../routes/projectRoutes');
const taskRoutes = require('../routes/taskRoutes');

// Error handler
const errorHandler = require('../middlewares/errorHandler');

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);

// Default route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the NLP Task Manager API' });
});

// Error handling middleware
app.use(errorHandler);

module.exports = app; 