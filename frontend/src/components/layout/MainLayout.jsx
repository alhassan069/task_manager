import { Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import { useTheme } from '../../context/ThemeContext';

const MainLayout = () => {
  const { theme } = useTheme();
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Add a small delay to allow for smooth transition when the page loads
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div 
      className={`min-h-screen bg-gradient-to-br from-background to-background/90 transition-opacity duration-500 ${
        isLoaded ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-10">
        <div className="w-full transition-all duration-300 ease-in-out">
          <Outlet />
        </div>
      </main>
      
      {/* Glassmorphism footer - subtle design element */}
      <footer className="fixed bottom-0 left-0 right-0 h-1 bg-white/5 backdrop-blur-sm z-10" />
    </div>
  );
};

export default MainLayout; 