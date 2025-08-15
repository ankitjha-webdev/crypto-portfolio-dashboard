import React, { memo } from 'react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { retryLastFailedAction, clearError } from '../../store/slices/cryptoSlice';

interface ErrorDisplayProps {
  error: any;
  onRetry?: () => void;
  showRetry?: boolean;
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = memo(({
  error,
  onRetry,
  showRetry = true,
  className = '',
  size = 'medium',
}) => {
  const dispatch = useAppDispatch();

  if (!error) return null;

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      dispatch(retryLastFailedAction());
    }
    dispatch(clearError());
  };

  const handleDismiss = () => {
    dispatch(clearError());
  };

  const errorMessage = typeof error === 'string' ? error : error.message || 'An error occurred';
  const canRetry = typeof error === 'object' && error.canRetry;
  const isRefreshError = typeof error === 'object' && error.isRefreshError;

  const sizeClasses = {
    small: {
      container: 'p-3',
      icon: 'w-4 h-4',
      title: 'text-sm',
      message: 'text-xs',
      button: 'px-2 py-1 text-xs',
    },
    medium: {
      container: 'p-4',
      icon: 'w-5 h-5',
      title: 'text-sm',
      message: 'text-sm',
      button: 'px-3 py-1.5 text-sm',
    },
    large: {
      container: 'p-6',
      icon: 'w-6 h-6',
      title: 'text-base',
      message: 'text-sm',
      button: 'px-4 py-2 text-sm',
    },
  };

  const classes = sizeClasses[size];

  return (
    <div className={`
      bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg
      ${classes.container} ${className}
    `}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg 
            className={`${classes.icon} text-red-400 dark:text-red-300`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
            />
          </svg>
        </div>
        
        <div className="ml-3 flex-1">
          <h3 className={`font-medium text-red-800 dark:text-red-200 ${classes.title}`}>
            {isRefreshError ? 'Update Failed' : 'Error'}
          </h3>
          <p className={`mt-1 text-red-700 dark:text-red-300 ${classes.message}`}>
            {errorMessage}
          </p>
          
          {/* Error details in development */}
          {import.meta.env.DEV && typeof error === 'object' && error.originalMessage && (
            <details className="mt-2">
              <summary className={`cursor-pointer text-red-600 dark:text-red-400 ${classes.message}`}>
                Technical Details
              </summary>
              <pre className={`mt-1 text-red-600 dark:text-red-400 ${classes.message} whitespace-pre-wrap break-words`}>
                {error.originalMessage}
                {error.code && ` (Code: ${error.code})`}
              </pre>
            </details>
          )}
        </div>
        
        <div className="ml-4 flex-shrink-0 flex space-x-2">
          {showRetry && canRetry && (
            <button
              onClick={handleRetry}
              className={`
                bg-red-100 dark:bg-red-800 hover:bg-red-200 dark:hover:bg-red-700
                text-red-800 dark:text-red-200 font-medium rounded-md transition-colors
                focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
                dark:focus:ring-offset-red-900 ${classes.button}
              `}
            >
              Retry
            </button>
          )}
          
          <button
            onClick={handleDismiss}
            className={`
              text-red-400 dark:text-red-300 hover:text-red-600 dark:hover:text-red-100
              transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 
              focus:ring-offset-2 dark:focus:ring-offset-red-900 rounded-md p-1
            `}
          >
            <span className="sr-only">Dismiss</span>
            <svg className={classes.icon} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
});

ErrorDisplay.displayName = 'ErrorDisplay';

export default ErrorDisplay;