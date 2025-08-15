import React, { memo, useEffect } from 'react';
import { useAppSelector } from '../../hooks/useAppSelector';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { toggleTheme } from '../../store/slices/uiSlice';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const ThemeToggle: React.FC<ThemeToggleProps> = memo(({
  className = '',
  showLabel = false,
  size = 'md'
}) => {
  const dispatch = useAppDispatch();
  const theme = useAppSelector(state => state.ui.theme);

  useEffect(() => {
    const root = document.documentElement;

    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }    
  }, [theme]);

  const handleToggle = () => {
    dispatch(toggleTheme());
  };

  const sizeClasses = {
    sm: 'w-10 h-5',
    md: 'w-12 h-6',
    lg: 'w-14 h-7'
  };

  const toggleSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const iconSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4'
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {showLabel && (
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Theme
        </span>
      )}

      <button
        onClick={handleToggle}
        className={`
          relative inline-flex items-center ${sizeClasses[size]} 
          bg-gray-200 dark:bg-gray-700 rounded-full 
          transition-all duration-300 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
          dark:focus:ring-offset-gray-800
          hover:bg-gray-300 dark:hover:bg-gray-600
          shadow-inner
        `}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {/* Toggle Circle */}
        <span
          className={`
            ${toggleSizeClasses[size]} 
            bg-white dark:bg-gray-800 rounded-full shadow-lg
            transform transition-all duration-300 ease-in-out
            flex items-center justify-center
            ${theme === 'dark'
              ? (size === 'sm' ? 'translate-x-5' : size === 'md' ? 'translate-x-6' : 'translate-x-7')
              : 'translate-x-0.5'
            }
          `}
        >
          {/* Theme Icons */}
          {theme === 'light' ? (
            <svg
              className={`${iconSizeClasses[size]} text-yellow-500`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg
              className={`${iconSizeClasses[size]} text-blue-400`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"
              />
            </svg>
          )}
        </span>

        {/* Background Icons */}
        <div className="absolute inset-0 flex items-center justify-between px-1">
          <svg
            className={`${iconSizeClasses[size]} text-yellow-400 transition-opacity duration-300 ${theme === 'light' ? 'opacity-0' : 'opacity-60'
              }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
              clipRule="evenodd"
            />
          </svg>
          <svg
            className={`${iconSizeClasses[size]} text-blue-300 transition-opacity duration-300 ${theme === 'dark' ? 'opacity-0' : 'opacity-60'
              }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"
            />
          </svg>
        </div>
      </button>

      {showLabel && (
        <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
          {theme}
        </span>
      )}
    </div>
  );
});

ThemeToggle.displayName = 'ThemeToggle';

export default ThemeToggle;