import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastContextProvider } from './components/ui/toast-provider';
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LandingPage from './components/pages/LandingPage';
import LoginPage from './components/pages/LoginPage';
import RegisterPage from './components/pages/RegisterPage';
import DashboardPage from './components/pages/DashboardPage';
import ProjectPage from './components/pages/ProjectPage';
import { Toaster } from './components/ui/toast';
import { ErrorBoundary } from './components/ui/error-boundary';
import { KeyboardShortcuts } from './components/keyboard-shortcuts';
import { KeyboardShortcutsHelp } from './components/keyboard-shortcuts-help';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider defaultTheme="dark">
          <ToastContextProvider>
            <Router>
              <KeyboardShortcuts />
              <KeyboardShortcutsHelp />
              <Routes>
                <Route path="/" element={<MainLayout />}>
                  {/* Public routes */}
                  <Route index element={<LandingPage />} />
                  <Route path="login" element={<LoginPage />} />
                  <Route path="register" element={<RegisterPage />} />
                  
                  {/* Protected routes */}
                  <Route element={<ProtectedRoute />}>
                    <Route path="dashboard" element={<DashboardPage />} />
                    <Route path="projects/:projectId" element={<ProjectPage />} />
                  </Route>
                </Route>
              </Routes>
            </Router>
            <Toaster />
          </ToastContextProvider>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App; 