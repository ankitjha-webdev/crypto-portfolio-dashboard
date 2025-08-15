import { useEffect } from 'react';
import { useAppDispatch } from './useAppDispatch';
import { setTheme } from '../store/slices/uiSlice';

export const useThemeInitialization = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const initializeTheme = () => {
      if (typeof window === 'undefined') {
        return;
      }
      
      const savedTheme = localStorage.getItem('crypto-dashboard-theme');
      
      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
        dispatch(setTheme(savedTheme));
      } else {
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const theme = systemPrefersDark ? 'dark' : 'light';
        
        dispatch(setTheme(theme));
        
        localStorage.setItem('crypto-dashboard-theme', theme);
      }
    };

    initializeTheme();

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      if (typeof window === 'undefined') {
        return;
      }
      
      const savedTheme = localStorage.getItem('crypto-dashboard-theme');
      if (!savedTheme) {
        const theme = e.matches ? 'dark' : 'light';
        dispatch(setTheme(theme));
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [dispatch]);
};