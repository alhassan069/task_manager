import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';

// Create a mock AuthProvider
const MockAuthProvider = ({ children }) => {
  return children;
};

// Custom render function that includes providers
export function renderWithProviders(ui, options = {}) {
  const Wrapper = ({ children }) => {
    return (
      <BrowserRouter>
        <MockAuthProvider>
          {children}
        </MockAuthProvider>
      </BrowserRouter>
    );
  };

  return render(ui, { wrapper: Wrapper, ...options });
}

// Mock API functions
export const mockAPI = {
  authAPI: {
    login: vi.fn(),
    register: vi.fn(),
    getProfile: vi.fn(),
  },
  projectAPI: {
    getProjects: vi.fn(),
    getProject: vi.fn(),
    createProject: vi.fn(),
    updateProject: vi.fn(),
    deleteProject: vi.fn(),
  },
  taskAPI: {
    getTasks: vi.fn(),
    createTask: vi.fn(),
    updateTask: vi.fn(),
    deleteTask: vi.fn(),
    toggleTaskCompletion: vi.fn(),
  },
};

// Mock data generators
export const mockData = {
  projects: (count = 3) => {
    return Array.from({ length: count }, (_, i) => ({
      id: `project-${i + 1}`,
      name: `Project ${i + 1}`,
      description: `Description for project ${i + 1}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  },
  tasks: (count = 5, projectId = 'project-1') => {
    return Array.from({ length: count }, (_, i) => ({
      id: `task-${i + 1}`,
      title: `Task ${i + 1}`,
      projectId,
      completed: i % 2 === 0,
      priority: 'P3',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  },
  user: () => ({
    id: 'user-1',
    name: 'Test User',
    email: 'test@example.com',
  }),
}; 