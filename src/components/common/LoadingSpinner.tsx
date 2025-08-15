import React, { memo } from 'react';

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'success' | 'danger' | 'white';
  className?: string;
  text?: string;
  centered?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = memo(({
  size = 'md',
  color = 'primary',
  className = '',
  text,
  centered = false,
}) => {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const colorClasses = {
    primary: 'border-t-blue-600 dark:border-t-blue-400',
    secondary: 'border-t-gray-600 dark:border-t-gray-400',
    success: 'border-t-green-600 dark:border-t-green-400',
    danger: 'border-t-red-600 dark:border-t-red-400',
    white: 'border-t-white',
  };

  const textSizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
  };

  const spinner = (
    <div
      className={`
        animate-spin rounded-full border-2 border-gray-200 dark:border-gray-700
        ${sizeClasses[size]} 
        ${colorClasses[color]}
      `}
      role="status"
      aria-label="Loading"
    />
  );

  const content = (
    <div className={`flex items-center space-x-3 ${centered ? 'justify-center' : ''} ${!centered ? className : ''}`}>
      {spinner}
      {text && (
        <span className={`text-gray-600 dark:text-gray-300 ${textSizeClasses[size]} font-medium`}>
          {text}
        </span>
      )}
    </div>
  );

  if (centered) {
    return (
      <div className={`flex items-center justify-center w-full h-full min-h-[100px] ${className}`}>
        <div className="flex items-center space-x-3">
          <div
            className={`
              animate-spin rounded-full border-2 border-gray-200 dark:border-gray-700
              ${sizeClasses[size]} 
              ${colorClasses[color]}
            `}
            role="status"
            aria-label="Loading"
          />
          {text && (
            <span className={`text-gray-600 dark:text-gray-300 ${textSizeClasses[size]} font-medium`}>
              {text}
            </span>
          )}
        </div>
      </div>
    );
  }

  return content;
});

LoadingSpinner.displayName = 'LoadingSpinner';

export default LoadingSpinner;