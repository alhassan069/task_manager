import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Sparkles, FolderKanban, Users } from 'lucide-react';

const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-[90vh] flex flex-col items-center justify-center">
      <div className="text-center max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-5xl font-bold text-primary mb-6">
          Task Management with Natural Language
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Create and manage tasks using natural language. Just type what you want to do, 
          and we'll organize it for you.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {isAuthenticated() ? (
            <Button asChild size="lg">
              <Link to="/dashboard">Go to Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild size="lg">
                <Link to="/register">Get Started</Link>
              </Button>
              <Button asChild variant="glassSecondary" size="lg">
                <Link to="/login">Login</Link>
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <FeatureCard 
          title="Natural Language Input"
          description="Add tasks using natural language. For example: 'Finish report by Friday at 5pm'"
          icon={<Sparkles className="h-8 w-8" />}
        />
        <FeatureCard 
          title="Automatic Organization"
          description="Tasks are automatically parsed to extract due dates, assignees, and priorities"
          icon={<FolderKanban className="h-8 w-8" />}
        />
        <FeatureCard 
          title="Project Management"
          description="Organize tasks into projects and collaborate with team members"
          icon={<Users className="h-8 w-8" />}
        />
      </div>
    </div>
  );
};

// Feature card component
const FeatureCard = ({ title, description, icon }) => {
  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20">
      <CardHeader>
        <div className="mb-4">{icon}</div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardContent>
    </Card>
  );
};

export default LandingPage; 