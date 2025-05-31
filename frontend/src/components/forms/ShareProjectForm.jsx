import { useState } from 'react';
import { projectAPI } from '../../lib/api';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Spinner } from '../ui/spinner';
import { AlertCircle } from 'lucide-react';

export const ShareProjectForm = ({ project, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);
    
    try {
      await projectAPI.shareProject(project.id, email);
      setSuccess(true);
      setEmail('');
      
      // Call the onSuccess callback to refresh the project data
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err.message || 'Failed to share project. Please try again.');
      console.error('Error sharing project:', err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-sm text-muted-foreground mb-4">
        Enter the email address of the user you want to share this project with. 
        They must already have an account in the system.
      </div>
      
      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded flex items-center gap-2 text-sm">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-primary/10 border border-primary text-primary px-4 py-3 rounded text-sm">
          Project shared successfully!
        </div>
      )}
      
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email Address
        </label>
        <Input
          id="email"
          type="email"
          placeholder="user@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isSubmitting}
          required
        />
      </div>
      
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting || !email.trim()}>
          {isSubmitting ? <Spinner size="sm" /> : 'Share Project'}
        </Button>
      </div>
    </form>
  );
}; 