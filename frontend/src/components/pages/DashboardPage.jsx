import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectAPI } from '../../lib/api';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '../ui/card';
import { Spinner } from '../ui/spinner';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '../ui/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Plus, ExternalLink, RefreshCw } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

const DashboardPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [formError, setFormError] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load projects when component mounts
    fetchProjects();
  }, []);

  // Listen for keyboard shortcut to open new project dialog
  useEffect(() => {
    const handleNewProject = () => {
      setShowNewProjectForm(true);
    };
    
    document.addEventListener('keyboard:new-project', handleNewProject);
    return () => {
      document.removeEventListener('keyboard:new-project', handleNewProject);
    };
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await projectAPI.getProjects();
      // The API returns an array directly, not inside a 'projects' object
      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to load projects. Please try again.');
      toast({
        title: "Error",
        description: "Could not load your projects. Please try again later.",
        variant: "destructive",
      });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNewProjectChange = (e) => {
    const { name, value } = e.target;
    setNewProject((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNewProjectSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);

    try {
      // Validate form
      if (!newProject.name.trim()) {
        setFormError('Project name is required');
        return;
      }

      // Submit to API
      const data = await projectAPI.createProject(newProject);
      
      // Add new project to list and reset form
      setProjects((prev) => [...prev, data]);
      setNewProject({ name: '', description: '' });
      setShowNewProjectForm(false);
      
      // Show success toast
      toast({
        title: "Project created",
        description: `"${data.name}" has been created successfully.`,
      });
    } catch (err) {
      setFormError(err.message || 'Failed to create project. Please try again.');
      toast({
        title: "Error creating project",
        description: err.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Projects</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={fetchProjects}
            disabled={loading}
            title="Refresh projects"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Dialog open={showNewProjectForm} onOpenChange={setShowNewProjectForm}>
            <DialogTrigger asChild>
              <Button variant="default">
                <Plus className="mr-2 h-4 w-4" /> New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] backdrop-blur-lg bg-white/10 border-white/20">
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
              </DialogHeader>
              
              {formError && (
                <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded mb-4">
                  {formError}
                </div>
              )}
              
              <form onSubmit={handleNewProjectSubmit} className="space-y-4">
                <div className="space-y-2">
                  <FormLabel htmlFor="name">Project Name *</FormLabel>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={newProject.name}
                    onChange={handleNewProjectChange}
                    disabled={formLoading}
                  />
                </div>
                
                <div className="space-y-2">
                  <FormLabel htmlFor="description">Description (Optional)</FormLabel>
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    value={newProject.description}
                    onChange={handleNewProjectChange}
                    disabled={formLoading}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={formLoading}
                  >
                    {formLoading ? (
                      <>
                        <Spinner size="sm" className="mr-2" /> Creating...
                      </>
                    ) : (
                      'Create Project'
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Loading and Error States */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <Spinner size="lg" className="mb-4" />
          <p className="text-muted-foreground">Loading your projects...</p>
        </div>
      )}
      
      {error && !loading && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-6 py-4 rounded mb-6 flex flex-col items-center">
          <p className="mb-4">{error}</p>
          <Button onClick={fetchProjects} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" /> Try Again
          </Button>
        </div>
      )}

      {/* Projects List */}
      {!loading && !error && projects.length === 0 && (
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-center p-8">
          <CardContent className="pt-6">
            <p className="mb-4">You don't have any projects yet.</p>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  Create Your First Project
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] backdrop-blur-lg bg-white/10 border-white/20">
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                </DialogHeader>
                
                {formError && (
                  <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded mb-4">
                    {formError}
                  </div>
                )}
                
                <form onSubmit={handleNewProjectSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <FormLabel htmlFor="new-name">Project Name *</FormLabel>
                    <Input
                      id="new-name"
                      name="name"
                      type="text"
                      required
                      value={newProject.name}
                      onChange={handleNewProjectChange}
                      disabled={formLoading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <FormLabel htmlFor="new-description">Description (Optional)</FormLabel>
                    <textarea
                      id="new-description"
                      name="description"
                      rows={3}
                      value={newProject.description}
                      onChange={handleNewProjectChange}
                      disabled={formLoading}
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={formLoading}
                    >
                      {formLoading ? (
                        <>
                          <Spinner size="sm" className="mr-2" /> Creating...
                        </>
                      ) : (
                        'Create Project'
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      )}

      {!loading && projects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="bg-white/10 backdrop-blur-lg border-white/20 hover:shadow-lg transition">
              <CardHeader>
                <CardTitle>{project.name || 'Untitled Project'}</CardTitle>
                {project.description && (
                  <CardDescription className="line-clamp-2">{project.description}</CardDescription>
                )}
              </CardHeader>
              <CardFooter className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'No date'}
                </span>
                <Button variant="ghost" size="sm" asChild>
                  <Link to={`/projects/${project.id}`}>
                    View Project <ExternalLink className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardPage; 