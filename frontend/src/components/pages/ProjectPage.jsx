import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectAPI, taskAPI, authAPI } from '../../lib/api';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Spinner } from '../ui/spinner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { ArrowLeft, Plus, Trash2, Edit, Check, X, Sparkles, Search, Filter, Users, Calendar, Clock } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ShareProjectForm } from '../forms/ShareProjectForm';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '../command';

const ProjectPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  
  // Project state
  const [project, setProject] = useState(null);
  const [projectLoading, setProjectLoading] = useState(true);
  const [projectError, setProjectError] = useState(null);
  
  // Tasks state
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [tasksError, setTasksError] = useState(null);
  
  // New task state
  const [newTaskText, setNewTaskText] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [nlpParsedTask, setNlpParsedTask] = useState(null);
  const [isNlpMode, setIsNlpMode] = useState(true);
  const [manualTaskInput, setManualTaskInput] = useState({
    task_name: '',
    assigned_to: 'unassigned',
    due_date: '',
    priority: 'P3'
  });
  
  // Edit task state
  const [editingTask, setEditingTask] = useState(null);
  const [editTaskText, setEditTaskText] = useState('');
  const [editingField, setEditingField] = useState(null);
  const [editValues, setEditValues] = useState({
    task_name: '',
    assigned_to: '',
    due_date: '',
    priority: ''
  });
  
  // Debounce state for assignee search
  const [assigneeSearch, setAssigneeSearch] = useState('');
  const [assigneeSearchResults, setAssigneeSearchResults] = useState([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const searchTimeout = useRef(null);
  
  // Delete confirmation state
  const [taskToDelete, setTaskToDelete] = useState(null);
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    assignee: '',
    priority: '',
    dueDate: '',
    isComplete: ''
  });
  const [projectMembers, setProjectMembers] = useState([]);
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'card'
  const [currentPage, setCurrentPage] = useState(1);
  const searchInputRef = useRef(null);
  
  useEffect(() => {
    // Load project and tasks when component mounts
    fetchProject();
    fetchTasks();
  }, [projectId]);
  
  // Handle keyboard shortcut for search focus
  useEffect(() => {
    const handleFocusSearch = () => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    };
    
    document.addEventListener('keyboard:focus-search', handleFocusSearch);
    return () => {
      document.removeEventListener('keyboard:focus-search', handleFocusSearch);
    };
  }, []);
  
  // Apply filters when they change
  useEffect(() => {
    fetchTasks();
  }, [searchQuery, filters]);
  
  // Debounced user search
  useEffect(() => {
    if (!assigneeSearch.trim() || assigneeSearch.length < 2) {
      setAssigneeSearchResults([]);
      return;
    }
    
    // Clear previous timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    
    setIsSearchingUsers(true);
    
    // Set new timeout for debouncing
    searchTimeout.current = setTimeout(async () => {
      try {
        // Use the API to search users
        const users = await authAPI.searchUsers(assigneeSearch);
        console.log('Search results:', users); // Debug log
        setAssigneeSearchResults(users);
      } catch (err) {
        console.error('Failed to search users:', err);
        setAssigneeSearchResults([]);
      } finally {
        setIsSearchingUsers(false);
      }
    }, 300); // 300ms debounce
    
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [assigneeSearch]);
  
  const fetchProject = async () => {
    setProjectLoading(true);
    setProjectError(null);
    try {
      const data = await projectAPI.getProject(projectId);
      setProject(data);
      
      // Collect project members for assignee filter
      const members = [];
      if (data.owner) {
        members.push(data.owner);
      }
      if (data.members && Array.isArray(data.members)) {
        members.push(...data.members);
      }
      setProjectMembers(members);
    } catch (err) {
      setProjectError('Failed to load project. Please try again.');
      console.error(err);
    } finally {
      setProjectLoading(false);
    }
  };
  
  const fetchTasks = async () => {
    setTasksLoading(true);
    setTasksError(null);
    try {
      const data = await taskAPI.getTasks(projectId, {
        search: searchQuery,
        assignee: filters.assignee,
        priority: filters.priority,
        dueDate: filters.dueDate,
        isComplete: filters.isComplete
      });
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      setTasksError('Failed to load tasks. Please try again.');
      console.error(err);
    } finally {
      setTasksLoading(false);
    }
  };
  
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === 'all' ? '' : value
    }));
    
    // If we're changing filters, make sure we're in the first page
    setCurrentPage(1);
  };
  
  const clearFilters = () => {
    setSearchQuery('');
    setFilters({
      assignee: '',
      priority: '',
      dueDate: '',
      isComplete: ''
    });
  };
  
  const handleAddTask = async (e) => {
    e.preventDefault();
    
    setIsAddingTask(true);
    try {
      if (isNlpMode) {
        // Use NLP parsing
        if (!newTaskText.trim()) return;
        const result = await taskAPI.createTaskWithNLP(newTaskText, projectId);
        setTasks((prev) => [...prev, result.task]);
        // Show parsed task preview briefly
        setNlpParsedTask(result.parsed);
        setTimeout(() => setNlpParsedTask(null), 5000); // Clear after 5 seconds
        setNewTaskText('');
      } else {
        // Use manual task creation with all fields
        if (!manualTaskInput.task_name.trim()) return;
        const newTask = await taskAPI.createTask({
          task_name: manualTaskInput.task_name,
          project_id: projectId,
          assigned_to: manualTaskInput.assigned_to === 'unassigned' ? undefined : manualTaskInput.assigned_to || undefined,
          due_date: manualTaskInput.due_date || undefined,
          priority: manualTaskInput.priority || 'P3',
        });
        
        setTasks((prev) => [...prev, newTask]);
        setManualTaskInput({
          task_name: '',
          assigned_to: 'unassigned',
          due_date: '',
          priority: 'P3'
        });
      }
    } catch (err) {
      console.error('Failed to add task:', err);
      alert('Failed to add task. Please try again.');
    } finally {
      setIsAddingTask(false);
    }
  };
  
  // Start editing a specific field in a task
  const startEditingField = (task, field) => {
    setEditingTask(task.id);
    setEditingField(field);
    
    // Set initial values
    setEditValues({
      task_name: task.task_name,
      assigned_to: task.assignee?.id || '',
      due_date: task.due_date ? new Date(task.due_date).toISOString().slice(0, 16) : '', // Format for datetime-local input
      priority: task.priority
    });
    
    // If editing assignee, initialize search and open popover
    if (field === 'assigned_to') {
      setAssigneeSearch('');
      setAssigneeSearchResults([]);
      setIsPopoverOpen(true);
    }
  };
  
  // Start editing an entire row
  const startEditingRow = (task) => {
    setEditingTask(task.id);
    setEditingField('row');
    
    // Set initial values for all fields
    setEditValues({
      task_name: task.task_name,
      assigned_to: task.assignee?.id || '',
      due_date: task.due_date ? new Date(task.due_date).toISOString().slice(0, 16) : '',
      priority: task.priority
    });
    
    // Initialize assignee search
    setAssigneeSearch('');
    setAssigneeSearchResults([]);
    setIsPopoverOpen(false);
  };
  
  // Cancel editing
  const cancelEditing = () => {
    setEditingTask(null);
    setEditingField(null);
    setIsPopoverOpen(false);
  };
  
  // Save changes to a specific field
  const saveFieldEdit = async (taskId, field) => {
    try {
      const value = editValues[field];
      
      if (field === 'assigned_to' && !value) {
        return; // Don't save empty assignee
      }
      
      const updateData = { [field]: value };
      
      const updatedTask = await taskAPI.updateTask(taskId, updateData);
      
      setTasks((prev) => 
        prev.map((task) => (task.id === taskId ? updatedTask : task))
      );
      
      setEditingTask(null);
      setEditingField(null);
    } catch (err) {
      console.error(`Failed to update ${field}:`, err);
      alert(`Failed to update task ${field}. Please try again.`);
    }
  };
  
  // Handle changes to edit values
  const handleEditValueChange = (field, value) => {
    setEditValues(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Select an assignee from search results
  const selectAssignee = (userId) => {
    console.log('Selecting assignee with ID:', userId);
    
    setEditValues(prev => ({
      ...prev,
      assigned_to: userId
    }));
    
    // Clear search results
    setAssigneeSearch('');
    setAssigneeSearchResults([]);
    
    // If in row edit mode, don't auto-save
    if (editingField !== 'row') {
      // Auto-save after selection
      saveFieldEdit(editingTask, 'assigned_to');
    }
  };
  
  const handleEditTask = async (taskId) => {
    if (!editTaskText.trim()) return;
    
    try {
      const updatedTask = await taskAPI.updateTask(taskId, {
        title: editTaskText,
      });
      
      setTasks((prev) => 
        prev.map((task) => (task.id === taskId ? updatedTask : task))
      );
      setEditingTask(null);
    } catch (err) {
      console.error('Failed to update task:', err);
      alert('Failed to update task. Please try again.');
    }
  };
  
  const handleDeleteTask = async (taskId) => {
    try {
      await taskAPI.deleteTask(taskId);
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
      setTaskToDelete(null);
    } catch (err) {
      console.error('Failed to delete task:', err);
      alert('Failed to delete task. Please try again.');
    }
  };
  
  const handleToggleTaskCompletion = async (taskId, currentStatus) => {
    try {
      await taskAPI.toggleTaskCompletion(taskId);
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId ? { ...task, is_complete: !currentStatus } : task
        )
      );
    } catch (err) {
      console.error('Failed to toggle task completion:', err);
      alert('Failed to update task. Please try again.');
    }
  };
  
  const startEditingTask = (task) => {
    setEditingTask(task.id);
    setEditTaskText(task.title);
  };
  
  const cancelEditingTask = () => {
    setEditingTask(null);
  };
  
  if (projectLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    );
  }
  
  if (projectError) {
    return (
      <div className="py-6">
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded mb-4">
          {projectError}
        </div>
        <Button onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>
      </div>
    );
  }
  
  return (
    <div className="py-6">
      {/* Project Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mr-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">{project?.name || 'Project'}</h1>
        </div>
        
        {/* Share Project Button - Only visible to project owner */}
        {project?.isOwner && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Users className="h-4 w-4 mr-1" />
                Share Project
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Share Project</DialogTitle>
              </DialogHeader>
              <ShareProjectForm project={project} onSuccess={fetchProject} />
            </DialogContent>
          </Dialog>
        )}
      </div>
      
      {project?.description && (
        <p className="text-muted-foreground mb-6">{project.description}</p>
      )}
      
      {/* Show project members if any */}
      {project?.members && project.members.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-2">Shared with:</h3>
          <div className="flex flex-wrap gap-2">
            {project.members.map(member => (
              <Badge key={member.id} variant="outline" className="bg-white/5">
                {member.name} ({member.email})
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      {/* Add Task Form - Only visible to project owner */}
      {project?.isOwner && (
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Add New Task</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsNlpMode(!isNlpMode)}
                className={isNlpMode ? "text-primary" : "text-muted-foreground"}
              >
                <Sparkles className="h-4 w-4 mr-1" />
                NLP Mode {isNlpMode ? "On" : "Off"}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddTask} className="flex flex-col gap-2">
              {isNlpMode ? (
                <div className="flex gap-2">
                  <Input
                    placeholder="E.g. 'Finish landing page by tomorrow at 5pm P2'"
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    disabled={isAddingTask}
                    className="flex-grow"
                  />
                  <Button type="submit" disabled={isAddingTask || !newTaskText.trim()}>
                    {isAddingTask ? <Spinner size="sm" /> : <Plus className="h-4 w-4 mr-1" />}
                    Add
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Task Name</label>
                      <Input
                        placeholder="Enter task name"
                        value={manualTaskInput.task_name}
                        onChange={(e) => setManualTaskInput({...manualTaskInput, task_name: e.target.value})}
                        disabled={isAddingTask}
                      />
                    </div>
                    
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Assignee</label>
                      <Select
                        value={manualTaskInput.assigned_to}
                        onValueChange={(value) => setManualTaskInput({...manualTaskInput, assigned_to: value})}
                        disabled={isAddingTask}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select assignee" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unassigned">Unassigned</SelectItem>
                          {projectMembers.map(member => (
                            <SelectItem key={member.id} value={member.id.toString()}>
                              {member.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Due Date</label>
                      <Input
                        type="datetime-local"
                        value={manualTaskInput.due_date}
                        onChange={(e) => setManualTaskInput({...manualTaskInput, due_date: e.target.value})}
                        disabled={isAddingTask}
                      />
                    </div>
                    
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Priority</label>
                      <Select
                        value={manualTaskInput.priority}
                        onValueChange={(value) => setManualTaskInput({...manualTaskInput, priority: value})}
                        disabled={isAddingTask}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="P1">P1</SelectItem>
                          <SelectItem value="P2">P2</SelectItem>
                          <SelectItem value="P3">P3</SelectItem>
                          <SelectItem value="P4">P4</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button type="submit" disabled={isAddingTask || !manualTaskInput.task_name.trim()}>
                      {isAddingTask ? <Spinner size="sm" /> : <Plus className="h-4 w-4 mr-1" />}
                      Add Task
                    </Button>
                  </div>
                </div>
              )}
              
              {isNlpMode && (
                <div className="text-xs text-muted-foreground mt-1">
                  Use natural language: "Task name, assignee, due date, priority (P1-P4)"
                </div>
              )}
              
              {/* NLP Parsed Task Preview */}
              {nlpParsedTask && (
                <div className="mt-3 p-3 bg-primary/10 rounded-md border border-primary/20">
                  <div className="text-sm font-medium mb-1">Task parsed successfully:</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="font-semibold">Task:</span> {nlpParsedTask.taskName}
                    </div>
                    <div>
                      <span className="font-semibold">Assignee:</span> {nlpParsedTask.assignee || 'You'}
                    </div>
                    <div>
                      <span className="font-semibold">Due:</span> {nlpParsedTask.dueDate || 'No due date'}
                    </div>
                    <div>
                      <span className="font-semibold">Priority:</span> {nlpParsedTask.priority || 'P3'}
                    </div>
                  </div>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      )}
      
      {/* Search and Filter Section */}
      <Card className="bg-white/10 backdrop-blur-lg border-white/20 mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            {/* Search Bar */}
            <div className="flex gap-2">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-9"
                  ref={searchInputRef}
                />
              </div>
              <Button 
                variant="outline" 
                onClick={() => setIsFiltersVisible(!isFiltersVisible)}
                className={isFiltersVisible ? "bg-primary/10" : ""}
              >
                <Filter className="h-4 w-4 mr-1" />
                Filters
              </Button>
              {(searchQuery || filters.assignee || filters.priority || filters.dueDate || filters.isComplete) && (
                <Button variant="ghost" onClick={clearFilters} size="sm">
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>
            
            {/* Filters */}
            {isFiltersVisible && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2">
                {/* Assignee Filter */}
                <div>
                  <label className="text-xs text-muted-foreground mb-1 flex items-center">
                    <Users className="h-3 w-3 mr-1" />
                    Assignee
                  </label>
                  <Select 
                    value={filters.assignee} 
                    onValueChange={(value) => handleFilterChange('assignee', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All assignees" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All assignees</SelectItem>
                      {projectMembers.map(member => (
                        <SelectItem key={member.id} value={member.id.toString()}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Priority Filter */}
                <div>
                  <label className="text-xs text-muted-foreground mb-1 flex items-center">
                    Priority
                  </label>
                  <Select 
                    value={filters.priority} 
                    onValueChange={(value) => handleFilterChange('priority', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All priorities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All priorities</SelectItem>
                      <SelectItem value="P1">P1</SelectItem>
                      <SelectItem value="P2">P2</SelectItem>
                      <SelectItem value="P3">P3</SelectItem>
                      <SelectItem value="P4">P4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Due Date Filter */}
                <div>
                  <label className="text-xs text-muted-foreground mb-1 flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    Due Date
                  </label>
                  <Select 
                    value={filters.dueDate} 
                    onValueChange={(value) => handleFilterChange('dueDate', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All dates" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All dates</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This week</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                      <SelectItem value="no-date">No due date</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Completion Status Filter */}
                <div>
                  <label className="text-xs text-muted-foreground mb-1 flex items-center">
                    <Check className="h-3 w-3 mr-1" />
                    Status
                  </label>
                  <Select 
                    value={filters.isComplete} 
                    onValueChange={(value) => handleFilterChange('isComplete', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All tasks" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All tasks</SelectItem>
                      <SelectItem value="true">Completed</SelectItem>
                      <SelectItem value="false">Not completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            
            {/* Active Filters Display */}
            {(filters.assignee || filters.priority || filters.dueDate || filters.isComplete) && (
              <div className="flex flex-wrap gap-2 mt-2">
                {filters.assignee && (
                  <Badge variant="outline" className="bg-white/5">
                    Assignee: {projectMembers.find(m => m.id.toString() === filters.assignee)?.name || 'Unknown'}
                    <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => handleFilterChange('assignee', '')} />
                  </Badge>
                )}
                {filters.priority && (
                  <Badge variant="outline" className="bg-white/5">
                    Priority: {filters.priority}
                    <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => handleFilterChange('priority', '')} />
                  </Badge>
                )}
                {filters.dueDate && (
                  <Badge variant="outline" className="bg-white/5">
                    Due: {
                      filters.dueDate === 'today' ? 'Today' :
                      filters.dueDate === 'week' ? 'This week' :
                      filters.dueDate === 'overdue' ? 'Overdue' :
                      filters.dueDate === 'no-date' ? 'No due date' : ''
                    }
                    <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => handleFilterChange('dueDate', '')} />
                  </Badge>
                )}
                {filters.isComplete && (
                  <Badge variant="outline" className="bg-white/5">
                    {filters.isComplete === 'true' ? 'Completed' : 'Not completed'}
                    <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => handleFilterChange('isComplete', '')} />
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Task List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Tasks</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === 'table' ? 'card' : 'table')}
              className="flex items-center gap-1"
            >
              {viewMode === 'table' ? 'Card View' : 'Table View'}
            </Button>
          </div>
        </div>
        
        {tasksLoading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : tasksError ? (
          <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded">
            {tasksError}
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No tasks yet. Add your first task above.
          </div>
        ) : viewMode === 'table' ? (
          <div className="rounded-md border border-white/10 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]"></TableHead>
                  <TableHead>Task</TableHead>
                  <TableHead>Assignee</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task.id} className={task.is_complete ? "bg-primary/5" : ""}>
                    {/* Completion Status */}
                    <TableCell>
                      {project?.isOwner && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`rounded-full p-1 ${task.is_complete ? 'bg-primary/10' : 'bg-white/10'}`}
                          onClick={() => handleToggleTaskCompletion(task.id, task.is_complete)}
                        >
                          <Check className={`h-4 w-4 ${task.is_complete ? 'text-primary' : 'text-muted-foreground'}`} />
                        </Button>
                      )}
                    </TableCell>
                    
                    {/* Task Name */}
                    <TableCell className={task.is_complete ? "text-muted-foreground line-through" : ""}>
                      {editingTask === task.id && (editingField === 'task_name' || editingField === 'row') ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={editValues.task_name}
                            onChange={(e) => handleEditValueChange('task_name', e.target.value)}
                            className="h-8"
                            autoFocus
                          />
                        </div>
                      ) : (
                        <div>
                          {task.task_name}
                        </div>
                      )}
                    </TableCell>
                    
                    {/* Assignee */}
                    <TableCell>
                      {editingTask === task.id && (editingField === 'assigned_to' || editingField === 'row') ? (
                        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                          <PopoverTrigger asChild>
                            <Button 
                              variant="outline" 
                              className="justify-start w-full h-8"
                              onClick={() => setIsPopoverOpen(true)}
                            >
                              {projectMembers.find(m => m.id === editValues.assigned_to)?.name || 'Select assignee'}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="p-0 w-[250px]" align="start">
                            <div className="border-none p-0">
                              <div className="flex flex-col">
                                <div className="flex items-center border-b px-3">
                                  <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                                  <input
                                    className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="Search users..."
                                    value={assigneeSearch}
                                    onChange={(e) => setAssigneeSearch(e.target.value)}
                                    autoFocus
                                  />
                                </div>
                                {isSearchingUsers ? (
                                  <div className="py-6 text-center text-sm">Searching...</div>
                                ) : assigneeSearchResults.length === 0 ? (
                                  <div className="py-6 text-center text-sm">No users found</div>
                                ) : (
                                  <div className="max-h-[300px] overflow-y-auto p-1">
                                    {assigneeSearchResults.map(user => (
                                      <div
                                        key={user.id}
                                        className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                                        onClick={() => {
                                          console.log('Selected user:', user);
                                          selectAssignee(user.id);
                                          setIsPopoverOpen(false);
                                        }}
                                      >
                                        <div className="flex flex-col">
                                          <span className="font-medium">{user.name}</span>
                                          <span className="text-xs text-muted-foreground">{user.email}</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      ) : (
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {task.assignee?.name || 'Unassigned'}
                        </div>
                      )}
                    </TableCell>
                    
                    {/* Due Date */}
                    <TableCell>
                      {editingTask === task.id && (editingField === 'due_date' || editingField === 'row') ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="datetime-local"
                            value={editValues.due_date}
                            onChange={(e) => handleEditValueChange('due_date', e.target.value)}
                            className="h-8"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {task.due_date 
                            ? new Date(task.due_date).toLocaleString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : 'No due date'}
                        </div>
                      )}
                    </TableCell>
                    
                    {/* Priority */}
                    <TableCell>
                      {editingTask === task.id && (editingField === 'priority' || editingField === 'row') ? (
                        <div className="flex items-center gap-2">
                          <Select
                            value={editValues.priority}
                            onValueChange={(value) => handleEditValueChange('priority', value)}
                          >
                            <SelectTrigger className="h-8 w-[80px]">
                              <SelectValue placeholder="Priority" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="P1">P1</SelectItem>
                              <SelectItem value="P2">P2</SelectItem>
                              <SelectItem value="P3">P3</SelectItem>
                              <SelectItem value="P4">P4</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      ) : (
                        <Badge 
                          variant="outline" 
                          className={`
                            ${task.priority === 'P1' ? 'bg-destructive/20 text-destructive' : 
                              task.priority === 'P2' ? 'bg-warning/20 text-warning' : 
                              task.priority === 'P4' ? 'bg-muted/20 text-muted-foreground' : ''}
                          `}
                        >
                          {task.priority}
                        </Badge>
                      )}
                    </TableCell>
                    
                    {/* Actions */}
                    <TableCell>
                      {project?.isOwner && (
                        <div className="flex gap-1">
                          {editingTask === task.id && editingField === 'row' ? (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => {
                                  // Save all fields at once
                                  const updateData = {
                                    task_name: editValues.task_name,
                                    assigned_to: editValues.assigned_to,
                                    due_date: editValues.due_date,
                                    priority: editValues.priority
                                  };
                                  
                                  taskAPI.updateTask(task.id, updateData)
                                    .then(updatedTask => {
                                      setTasks((prev) => 
                                        prev.map((t) => (t.id === task.id ? updatedTask : t))
                                      );
                                      cancelEditing();
                                    })
                                    .catch(err => {
                                      console.error('Failed to update task:', err);
                                      alert('Failed to update task. Please try again.');
                                    });
                                }}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={cancelEditing}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEditingRow(task)}
                              disabled={editingTask !== null}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={editingTask === task.id}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Task</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this task? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteTask(task.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3 flex-grow">
                  {project?.isOwner && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`rounded-full p-1 ${task.is_complete ? 'bg-primary/20' : 'bg-white/10'}`}
                      onClick={() => handleToggleTaskCompletion(task.id, task.is_complete)}
                    >
                      <Check className={`h-4 w-4 ${task.is_complete ? 'text-primary' : 'text-muted-foreground'}`} />
                    </Button>
                  )}
                  
                  {editingTask === task.id ? (
                    <div className="flex-grow flex gap-2">
                      <Input
                        value={editTaskText}
                        onChange={(e) => setEditTaskText(e.target.value)}
                        className="flex-grow"
                        autoFocus
                      />
                      <Button size="sm" onClick={() => handleEditTask(task.id)}>
                        Save
                      </Button>
                      <Button size="sm" variant="ghost" onClick={cancelEditingTask}>
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="flex-grow">
                      <div className={`text-sm ${task.is_complete ? 'line-through text-muted-foreground' : ''}`}>
                        {task.task_name}
                      </div>
                      <div className="flex gap-2 mt-1">
                        {task.assignee && (
                          <Badge variant="outline" className="text-xs">
                            {task.assignee.name}
                          </Badge>
                        )}
                        {task.due_date && (
                          <Badge variant="outline" className="text-xs">
                            Due: {new Date(task.due_date).toLocaleDateString()}
                          </Badge>
                        )}
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            task.priority === 'P1' ? 'bg-destructive/20 text-destructive' : 
                            task.priority === 'P2' ? 'bg-warning/20 text-warning' : 
                            task.priority === 'P4' ? 'bg-muted/20 text-muted-foreground' : ''
                          }`}
                        >
                          {task.priority}
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
                
                {project?.isOwner && (
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEditingTask(task)}
                      disabled={editingTask === task.id}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Task</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this task? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteTask(task.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectPage; 