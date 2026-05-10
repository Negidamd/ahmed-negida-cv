import { useEffect } from 'react';
import { useNavigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, FileText, FolderOpen, GraduationCap, Presentation } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const Dashboard = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    } else if (!loading && user && !isAdmin) {
      navigate('/');
    }
  }, [user, isAdmin, loading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b">
          <div className="container mx-auto px-4 py-4">
            <Skeleton className="h-8 w-48" />
          </div>
        </div>
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  const isPublicationsActive = location.pathname.includes('/publications');
  const isProjectsActive = location.pathname.includes('/projects');
  const isTeachingActive = location.pathname.includes('/teaching');
  const isLecturesActive = location.pathname.includes('/lectures');

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-serif font-bold text-primary">Admin Dashboard</h1>
            <Button variant="outline" onClick={handleSignOut} className="gap-2">
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <nav className="mb-8 flex flex-wrap gap-4">
          <Link to="/dashboard/publications">
            <Button 
              variant={isPublicationsActive ? "default" : "outline"} 
              className="gap-2"
            >
              <FileText className="w-4 h-4" />
              Publications
            </Button>
          </Link>
          <Link to="/dashboard/projects">
            <Button 
              variant={isProjectsActive ? "default" : "outline"}
              className="gap-2"
            >
              <FolderOpen className="w-4 h-4" />
              Projects
            </Button>
          </Link>
          <Link to="/dashboard/teaching">
            <Button 
              variant={isTeachingActive ? "default" : "outline"}
              className="gap-2"
            >
              <GraduationCap className="w-4 h-4" />
              Teaching
            </Button>
          </Link>
          <Link to="/dashboard/lectures">
            <Button 
              variant={isLecturesActive ? "default" : "outline"}
              className="gap-2"
            >
              <Presentation className="w-4 h-4" />
              Lectures
            </Button>
          </Link>
        </nav>

        <Outlet />
      </div>
    </div>
  );
};

export default Dashboard;
