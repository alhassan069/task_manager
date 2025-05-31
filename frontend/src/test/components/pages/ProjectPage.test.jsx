import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProjectPage from '../../../components/pages/ProjectPage';
import { renderWithProviders, mockData } from '../../test-utils';
import * as api from '../../../lib/api';

// Mock the react-router-dom hooks
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ projectId: 'project-1' }),
    useNavigate: () => vi.fn(),
  };
});

// Mock the API module
vi.mock('../../../lib/api', () => ({
  projectAPI: {
    getProject: vi.fn(),
    shareProject: vi.fn(),
  },
  taskAPI: {
    getTasks: vi.fn(),
    createTask: vi.fn(),
    createTaskWithNLP: vi.fn(),
    updateTask: vi.fn(),
    deleteTask: vi.fn(),
    toggleTaskCompletion: vi.fn(),
  },
}));

describe('ProjectPage', () => {
  // Create project with isOwner flag and members array
  const project = {
    ...mockData.projects(1)[0],
    isOwner: true,
    owner: mockData.user(),
    members: [
      { id: 'user-2', name: 'Member 1', email: 'member1@example.com' },
      { id: 'user-3', name: 'Member 2', email: 'member2@example.com' },
    ]
  };
  
  // Create tasks with additional properties for filtering
  const tasks = [
    {
      id: 'task-1',
      task_name: 'Frontend Task',
      project_id: project.id,
      is_complete: false,
      priority: 'P1',
      due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      assignee: { id: 'user-1', name: 'Test User', email: 'test@example.com' }
    },
    {
      id: 'task-2',
      task_name: 'Backend Task',
      project_id: project.id,
      is_complete: false,
      priority: 'P2',
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      assignee: { id: 'user-1', name: 'Test User', email: 'test@example.com' }
    },
    {
      id: 'task-3',
      task_name: 'Testing Task',
      project_id: project.id,
      is_complete: true,
      priority: 'P3',
      due_date: null,
      assignee: { id: 'user-2', name: 'Member 1', email: 'member1@example.com' }
    }
  ];
  
  const user = userEvent.setup();
  
  beforeEach(() => {
    // Reset mocks before each test
    vi.resetAllMocks();
    
    // Default mock implementations
    api.projectAPI.getProject.mockResolvedValue(project);
    api.taskAPI.getTasks.mockResolvedValue(tasks);
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });
  
  it('should render loading state initially', () => {
    // Mock API to delay response
    api.projectAPI.getProject.mockImplementation(() => new Promise(resolve => {
      setTimeout(() => resolve(project), 1000);
    }));
    
    renderWithProviders(<ProjectPage />);
    
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
  
  it('should render project details and tasks when loaded successfully', async () => {
    renderWithProviders(<ProjectPage />);
    
    // Wait for project to load
    await waitFor(() => {
      expect(screen.getByText(project.name)).toBeInTheDocument();
    });
    
    // Check if project description is rendered
    expect(screen.getByText(project.description)).toBeInTheDocument();
    
    // Check if tasks are rendered
    tasks.forEach(task => {
      expect(screen.getByText(task.title)).toBeInTheDocument();
    });
  });
  
  it('should render error message when project API call fails', async () => {
    // Mock API error
    api.projectAPI.getProject.mockRejectedValue(new Error('Failed to load project'));
    
    renderWithProviders(<ProjectPage />);
    
    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/Failed to load project/i)).toBeInTheDocument();
    });
    
    // Check if back button is rendered
    expect(screen.getByText(/Back to Dashboard/i)).toBeInTheDocument();
  });
  
  it('should add a new task when form is submitted', async () => {
    const newTaskText = 'New test task';
    const newTask = {
      id: 'new-task-id',
      title: newTaskText,
      projectId: project.id,
      completed: false,
      priority: 'P3',
      createdAt: new Date().toISOString(),
    };
    
    api.taskAPI.createTask.mockResolvedValue(newTask);
    
    renderWithProviders(<ProjectPage />);
    
    // Wait for project to load
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Enter task description/i)).toBeInTheDocument();
    });
    
    // Type in the task input
    await user.type(screen.getByPlaceholderText(/Enter task description/i), newTaskText);
    
    // Submit the form
    await user.click(screen.getByText(/^Add$/i));
    
    // Check if API was called with correct data
    expect(api.taskAPI.createTask).toHaveBeenCalledWith({
      title: newTaskText,
      projectId: project.id,
      priority: 'P3',
    });
    
    // Wait for the new task to appear in the list
    await waitFor(() => {
      expect(api.taskAPI.createTask).toHaveBeenCalledTimes(1);
    });
  });
  
  it('should toggle task completion status when checkbox is clicked', async () => {
    const taskToToggle = tasks[0];
    
    renderWithProviders(<ProjectPage />);
    
    // Wait for tasks to load
    await waitFor(() => {
      expect(screen.getByText(taskToToggle.title)).toBeInTheDocument();
    });
    
    // Find the checkbox for the first task
    const checkbox = screen.getAllByRole('checkbox')[0];
    
    // Click the checkbox
    await user.click(checkbox);
    
    // Check if API was called with correct data
    expect(api.taskAPI.toggleTaskCompletion).toHaveBeenCalledWith(taskToToggle.id);
  });
  
  it('should open edit mode when edit button is clicked', async () => {
    const taskToEdit = tasks[0];
    
    renderWithProviders(<ProjectPage />);
    
    // Wait for tasks to load
    await waitFor(() => {
      expect(screen.getByText(taskToEdit.title)).toBeInTheDocument();
    });
    
    // Find all task items
    const taskItems = screen.getAllByText(/Task \d/);
    const taskItem = taskItems[0].closest('div.p-4');
    
    // Find the edit button within the task item (using the SVG icon)
    const editButton = within(taskItem).getByLabelText('Edit task');
    
    // Click the edit button
    await user.click(editButton);
    
    // Check if input field with task title appears
    const inputField = screen.getByDisplayValue(taskToEdit.title);
    expect(inputField).toBeInTheDocument();
    
    // Check if save button appears
    expect(screen.getByLabelText('Save changes')).toBeInTheDocument();
  });
  
  it('should update task when edit form is submitted', async () => {
    const taskToEdit = tasks[0];
    const updatedTitle = 'Updated task title';
    const updatedTask = { ...taskToEdit, title: updatedTitle };
    
    api.taskAPI.updateTask.mockResolvedValue(updatedTask);
    
    renderWithProviders(<ProjectPage />);
    
    // Wait for tasks to load
    await waitFor(() => {
      expect(screen.getByText(taskToEdit.title)).toBeInTheDocument();
    });
    
    // Find all task items
    const taskItems = screen.getAllByText(/Task \d/);
    const taskItem = taskItems[0].closest('div.p-4');
    
    // Find the edit button within the task item
    const editButton = within(taskItem).getByLabelText('Edit task');
    
    // Click the edit button
    await user.click(editButton);
    
    // Find the input field
    const inputField = screen.getByDisplayValue(taskToEdit.title);
    
    // Clear the input and type new title
    await user.clear(inputField);
    await user.type(inputField, updatedTitle);
    
    // Click save button
    await user.click(screen.getByLabelText('Save changes'));
    
    // Check if API was called with correct data
    expect(api.taskAPI.updateTask).toHaveBeenCalledWith(taskToEdit.id, {
      title: updatedTitle,
    });
  });
  
  describe('Project Sharing', () => {
    it('should render share project button when user is the owner', async () => {
      renderWithProviders(<ProjectPage />);
      
      await waitFor(() => {
        expect(screen.getByText(project.name)).toBeInTheDocument();
      });
      
      expect(screen.getByText('Share Project')).toBeInTheDocument();
    });
    
    it('should not render share project button when user is not the owner', async () => {
      // Mock project with isOwner set to false
      api.projectAPI.getProject.mockResolvedValue({
        ...project,
        isOwner: false
      });
      
      renderWithProviders(<ProjectPage />);
      
      await waitFor(() => {
        expect(screen.getByText(project.name)).toBeInTheDocument();
      });
      
      expect(screen.queryByText('Share Project')).not.toBeInTheDocument();
    });
    
    it('should open share dialog when share button is clicked', async () => {
      renderWithProviders(<ProjectPage />);
      
      await waitFor(() => {
        expect(screen.getByText(project.name)).toBeInTheDocument();
      });
      
      // Click share button
      await user.click(screen.getByText('Share Project'));
      
      // Check if dialog is open
      expect(screen.getByText('Share Project', { selector: 'h2' })).toBeInTheDocument();
      expect(screen.getByPlaceholderText('user@example.com')).toBeInTheDocument();
    });
    
    it('should display project members when project has members', async () => {
      renderWithProviders(<ProjectPage />);
      
      await waitFor(() => {
        expect(screen.getByText(project.name)).toBeInTheDocument();
      });
      
      // Check if members are displayed
      expect(screen.getByText('Shared with:')).toBeInTheDocument();
      project.members.forEach(member => {
        expect(screen.getByText(`${member.name} (${member.email})`)).toBeInTheDocument();
      });
    });
    
    it('should submit share form with correct email', async () => {
      api.projectAPI.shareProject.mockResolvedValue({ message: 'Project shared successfully' });
      
      renderWithProviders(<ProjectPage />);
      
      await waitFor(() => {
        expect(screen.getByText(project.name)).toBeInTheDocument();
      });
      
      // Click share button
      await user.click(screen.getByText('Share Project'));
      
      // Enter email
      await user.type(screen.getByPlaceholderText('user@example.com'), 'newuser@example.com');
      
      // Submit form
      await user.click(screen.getByText('Share Project', { selector: 'button' }));
      
      // Check if API was called with correct data
      expect(api.projectAPI.shareProject).toHaveBeenCalledWith(project.id, 'newuser@example.com');
    });
  });
  
  describe('Search and Filter', () => {
    it('should render search and filter components', async () => {
      renderWithProviders(<ProjectPage />);
      
      await waitFor(() => {
        expect(screen.getByText(project.name)).toBeInTheDocument();
      });
      
      // Check if search input exists
      expect(screen.getByPlaceholderText('Search tasks...')).toBeInTheDocument();
      
      // Check if filter button exists
      expect(screen.getByText('Filters')).toBeInTheDocument();
    });
    
    it('should filter tasks when search query is entered', async () => {
      // Mock filtered tasks response
      const filteredTasks = [tasks[0]]; // Only Frontend Task
      api.taskAPI.getTasks.mockResolvedValueOnce(tasks) // Initial load
        .mockResolvedValueOnce(filteredTasks); // After search
      
      renderWithProviders(<ProjectPage />);
      
      await waitFor(() => {
        expect(screen.getByText(project.name)).toBeInTheDocument();
      });
      
      // Enter search query
      await user.type(screen.getByPlaceholderText('Search tasks...'), 'Frontend');
      
      // Check if API was called with search parameter
      await waitFor(() => {
        expect(api.taskAPI.getTasks).toHaveBeenCalledWith(project.id, expect.objectContaining({
          search: 'Frontend'
        }));
      });
    });
    
    it('should show filter options when filter button is clicked', async () => {
      renderWithProviders(<ProjectPage />);
      
      await waitFor(() => {
        expect(screen.getByText(project.name)).toBeInTheDocument();
      });
      
      // Click filter button
      await user.click(screen.getByText('Filters'));
      
      // Check if filter options are displayed
      expect(screen.getByText('Assignee')).toBeInTheDocument();
      expect(screen.getByText('Priority')).toBeInTheDocument();
      expect(screen.getByText('Due Date')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
    });
    
    it('should apply priority filter when selected', async () => {
      // Mock filtered tasks response
      const filteredTasks = [tasks[0]]; // Only P1 task
      api.taskAPI.getTasks.mockResolvedValueOnce(tasks) // Initial load
        .mockResolvedValueOnce(filteredTasks); // After filter
      
      renderWithProviders(<ProjectPage />);
      
      await waitFor(() => {
        expect(screen.getByText(project.name)).toBeInTheDocument();
      });
      
      // Click filter button
      await user.click(screen.getByText('Filters'));
      
      // Click priority dropdown
      await user.click(screen.getByText('All priorities'));
      
      // Select P1 priority
      await user.click(screen.getByText('P1'));
      
      // Check if API was called with priority parameter
      await waitFor(() => {
        expect(api.taskAPI.getTasks).toHaveBeenCalledWith(project.id, expect.objectContaining({
          priority: 'P1'
        }));
      });
    });
    
    it('should clear all filters when clear button is clicked', async () => {
      // Mock filtered tasks response
      api.taskAPI.getTasks.mockResolvedValueOnce(tasks) // Initial load
        .mockResolvedValueOnce([tasks[0]]) // After filter
        .mockResolvedValueOnce(tasks); // After clear
      
      renderWithProviders(<ProjectPage />);
      
      await waitFor(() => {
        expect(screen.getByText(project.name)).toBeInTheDocument();
      });
      
      // Click filter button
      await user.click(screen.getByText('Filters'));
      
      // Click priority dropdown
      await user.click(screen.getByText('All priorities'));
      
      // Select P1 priority
      await user.click(screen.getByText('P1'));
      
      // Wait for filter to be applied
      await waitFor(() => {
        expect(api.taskAPI.getTasks).toHaveBeenCalledWith(project.id, expect.objectContaining({
          priority: 'P1'
        }));
      });
      
      // Click clear button
      await user.click(screen.getByText('Clear'));
      
      // Check if API was called with empty filters
      await waitFor(() => {
        expect(api.taskAPI.getTasks).toHaveBeenCalledWith(project.id, expect.objectContaining({
          priority: ''
        }));
      });
    });
  });
}); 