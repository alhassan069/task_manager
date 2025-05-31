import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DashboardPage from '../../../components/pages/DashboardPage';
import { renderWithProviders, mockData } from '../../test-utils';
import * as api from '../../../lib/api';

// Mock the API module
vi.mock('../../../lib/api', () => ({
  projectAPI: {
    getProjects: vi.fn(),
    createProject: vi.fn(),
  },
}));

// Mock the toast hook
vi.mock('../../hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe('DashboardPage', () => {
  const projects = mockData.projects(3);
  const user = userEvent.setup();
  
  beforeEach(() => {
    // Reset mocks before each test
    vi.resetAllMocks();
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });
  
  it('should render loading state initially', () => {
    // Mock API to delay response
    api.projectAPI.getProjects.mockImplementation(() => new Promise(resolve => {
      setTimeout(() => resolve(projects), 1000);
    }));
    
    renderWithProviders(<DashboardPage />);
    
    expect(screen.getByText(/Loading your projects/i)).toBeInTheDocument();
  });
  
  it('should render projects when loaded successfully', async () => {
    // Mock successful API response
    api.projectAPI.getProjects.mockResolvedValue(projects);
    
    renderWithProviders(<DashboardPage />);
    
    // Wait for projects to load
    await waitFor(() => {
      expect(screen.getByText(projects[0].name)).toBeInTheDocument();
    });
    
    // Check if all projects are rendered
    projects.forEach(project => {
      expect(screen.getByText(project.name)).toBeInTheDocument();
    });
  });
  
  it('should render error message when API call fails', async () => {
    // Mock API error
    api.projectAPI.getProjects.mockRejectedValue(new Error('Failed to load projects'));
    
    renderWithProviders(<DashboardPage />);
    
    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/Failed to load projects/i)).toBeInTheDocument();
    });
    
    // Check if retry button is rendered using a more specific selector
    const tryAgainButton = screen.getByRole('button', {
      name: (content) => content.includes('Try Again')
    });
    expect(tryAgainButton).toBeInTheDocument();
  });
  
  it('should open new project dialog when button is clicked', async () => {
    // Mock successful API response
    api.projectAPI.getProjects.mockResolvedValue(projects);
    
    renderWithProviders(<DashboardPage />);
    
    // Wait for projects to load
    await waitFor(() => {
      expect(screen.getByText(/New Project/i)).toBeInTheDocument();
    });
    
    // Click on New Project button
    await user.click(screen.getByText(/New Project/i));
    
    // Check if dialog is opened
    expect(screen.getByText(/Create New Project/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Project Name/i)).toBeInTheDocument();
  });
  
  it('should create a new project when form is submitted', async () => {
    // Mock successful API responses
    api.projectAPI.getProjects.mockResolvedValue(projects);
    
    const newProject = {
      name: 'New Test Project',
      description: 'Test project description',
    };
    
    const createdProject = {
      ...newProject,
      id: 'new-project-id',
      createdAt: new Date().toISOString(),
    };
    
    api.projectAPI.createProject.mockResolvedValue(createdProject);
    
    renderWithProviders(<DashboardPage />);
    
    // Wait for projects to load
    await waitFor(() => {
      expect(screen.getByText(/New Project/i)).toBeInTheDocument();
    });
    
    // Click on New Project button
    await user.click(screen.getByText(/New Project/i));
    
    // Fill out the form
    await user.type(screen.getByLabelText(/Project Name/i), newProject.name);
    await user.type(screen.getByLabelText(/Description/i), newProject.description);
    
    // Submit the form
    await user.click(screen.getByRole('button', { name: /^Create Project$/i }));
    
    // Check if API was called with correct data
    expect(api.projectAPI.createProject).toHaveBeenCalledWith(newProject);
    
    // Wait for the new project to appear in the list
    await waitFor(() => {
      expect(api.projectAPI.createProject).toHaveBeenCalledTimes(1);
    });
  });
}); 