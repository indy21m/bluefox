import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider as EmotionThemeProvider, Global } from '@emotion/react';
import { lightTheme, darkTheme, globalStyles } from './index';
import type { Theme } from '@emotion/react';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultDark?: boolean;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  defaultDark = false 
}) => {
  const [isDark, setIsDark] = useState(() => {
    // Check localStorage first, then system preference, then default
    const stored = localStorage.getItem('bluefox-theme');
    if (stored) {
      return stored === 'dark';
    }
    
    // Check system preference
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    
    return defaultDark;
  });

  const theme = isDark ? darkTheme : lightTheme;

  useEffect(() => {
    // Save theme preference
    localStorage.setItem('bluefox-theme', isDark ? 'dark' : 'light');
    
    // Update document class for CSS targeting
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme.colors.background.primary);
    }
  }, [isDark, theme]);

  useEffect(() => {
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      // Only auto-switch if user hasn't set a manual preference
      const stored = localStorage.getItem('bluefox-theme');
      if (!stored) {
        setIsDark(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const setTheme = (dark: boolean) => {
    setIsDark(dark);
  };

  const contextValue: ThemeContextType = {
    theme,
    isDark,
    toggleTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <EmotionThemeProvider theme={theme}>
        <Global styles={globalStyles} />
        {children}
      </EmotionThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Utility hook for responsive design
export const useBreakpoint = () => {
  const { theme } = useTheme();
  const [breakpoint, setBreakpoint] = useState<string>('xs');

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      
      if (width >= parseInt(theme.breakpoints['2xl'])) {
        setBreakpoint('2xl');
      } else if (width >= parseInt(theme.breakpoints.xl)) {
        setBreakpoint('xl');
      } else if (width >= parseInt(theme.breakpoints.lg)) {
        setBreakpoint('lg');
      } else if (width >= parseInt(theme.breakpoints.md)) {
        setBreakpoint('md');
      } else if (width >= parseInt(theme.breakpoints.sm)) {
        setBreakpoint('sm');
      } else {
        setBreakpoint('xs');
      }
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, [theme.breakpoints]);

  return {
    breakpoint,
    isXs: breakpoint === 'xs',
    isSm: breakpoint === 'sm',
    isMd: breakpoint === 'md',
    isLg: breakpoint === 'lg',
    isXl: breakpoint === 'xl',
    is2Xl: breakpoint === '2xl',
    isMobile: breakpoint === 'xs' || breakpoint === 'sm',
    isTablet: breakpoint === 'md',
    isDesktop: breakpoint === 'lg' || breakpoint === 'xl' || breakpoint === '2xl',
  };
};