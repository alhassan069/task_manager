import axios from 'axios';

// API base URL - change this to your backend URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Create an axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add an interceptor to include the auth token in every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Authentication API calls
export const authAPI = {
  // Register a new user
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'An error occurred during registration' };
    }
  },

  // Login a user
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Invalid credentials' };
    }
  },

  // Get current user profile
  getProfile: async () => {
    try {
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get profile' };
    }
  },
  
  // Search users by name or email
  searchUsers: async (query) => {
    try {
      if (!query || query.length < 2) {
        return [];
      }
      
      const response = await api.get('/auth/search', {
        params: { query }
      });
      return response.data;
    } catch (error) {
      console.error('User search error:', error);
      throw error.response?.data || { message: 'Failed to search users' };
    }
  },
};

// Project API calls
export const projectAPI = {
  // Create a new project
  createProject: async (projectData) => {
    try {
      const response = await api.post('/projects', projectData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create project' };
    }
  },

  // Get all projects for the current user
  getProjects: async () => {
    try {
      const response = await api.get('/projects');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get projects' };
    }
  },

  // Get a specific project by ID
  getProject: async (projectId) => {
    try {
      const response = await api.get(`/projects/${projectId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get project' };
    }
  },

  // Update a project
  updateProject: async (projectId, projectData) => {
    try {
      const response = await api.put(`/projects/${projectId}`, projectData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update project' };
    }
  },

  // Delete a project
  deleteProject: async (projectId) => {
    try {
      const response = await api.delete(`/projects/${projectId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete project' };
    }
  },

  // Share a project with another user
  shareProject: async (projectId, email) => {
    try {
      const response = await api.post(`/projects/${projectId}/share`, { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to share project' };
    }
  },
};

// Task API calls
export const taskAPI = {
  // Create a new task
  createTask: async (taskData) => {
    try {
      const response = await api.post('/tasks', taskData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create task' };
    }
  },

  // Create a task using NLP parsing
  createTaskWithNLP: async (taskInput, projectId) => {
    try {
      const response = await api.post('/tasks/nlp', {
        taskInput,
        project_id: projectId
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to parse and create task' };
    }
  },

  // Get all tasks for a project
  getTasks: async (projectId, filters = {}) => {
    try {
      const response = await api.get('/tasks', {
        params: { 
          project_id: projectId,
          search: filters.search,
          assignee: filters.assignee,
          priority: filters.priority,
          due_date: filters.dueDate,
          is_complete: filters.isComplete
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get tasks' };
    }
  },

  // Get a specific task by ID
  getTask: async (taskId) => {
    try {
      const response = await api.get(`/tasks/${taskId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get task' };
    }
  },

  // Update a task
  updateTask: async (taskId, taskData) => {
    try {
      const response = await api.put(`/tasks/${taskId}`, taskData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update task' };
    }
  },

  // Delete a task
  deleteTask: async (taskId) => {
    try {
      const response = await api.delete(`/tasks/${taskId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete task' };
    }
  },

  // Toggle task completion status
  toggleTaskCompletion: async (taskId) => {
    try {
      const response = await api.patch(`/tasks/${taskId}/complete`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to toggle task completion' };
    }
  },
};

export default api; 