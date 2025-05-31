import { createContext, useContext, useEffect, useState } from 'react';

// Create theme context
const ThemeContext = createContext({
  theme: 'light',
  setTheme: () => null,
});

// Custom hook to use the theme context
export const useTheme = () => {
  return useContext(ThemeContext);
};

// Provider component that wraps the app and makes theme object available
export const ThemeProvider = ({ defaultTheme = 'dark', children }) => {
  const [theme, setTheme] = useState(
    () => localStorage.getItem('theme') || defaultTheme
  );

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove the previous theme class
    root.classList.remove('light', 'dark');
    
    // Add the current theme class
    root.classList.add(theme);
    
    // Save theme to localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  const value = {
    theme,
    setTheme: (newTheme) => {
      setTheme(newTheme);
    },
    toggleTheme: () => {
      setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    }
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export default ThemeContext; 