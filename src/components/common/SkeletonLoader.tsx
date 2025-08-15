import React, { memo } from 'react';

interface SkeletonLoaderProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
  animate?: boolean;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = memo(({
  className = '',
  width = '100%',
  height = '1rem',
  rounded = false,
  animate = true,
}) => {
  const widthStyle = typeof width === 'number' ? `${width}px` : width;
  const heightStyle = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={`
        bg-gray-200 dark:bg-gray-700 
        ${rounded ? 'rounded-full' : 'rounded'}
        ${animate ? 'animate-pulse' : ''}
        ${className}
      `}
      style={{
        width: widthStyle,
        height: heightStyle,
      }}
      aria-label="Loading..."
    />
  );
});

SkeletonLoader.displayName = 'SkeletonLoader';

export const SkeletonText: React.FC<{ lines?: number; className?: string }> = memo(({ 
  lines = 1, 
  className = '' 
}) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, index) => (
      <SkeletonLoader
        key={index}
        height="1rem"
        width={index === lines - 1 ? '75%' : '100%'}
      />
    ))}
  </div>
));

export const SkeletonAvatar: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = memo(({ 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  return (
    <SkeletonLoader
      className={`${sizeClasses[size]} ${className}`}
      rounded
    />
  );
});

export const SkeletonCard: React.FC<{ className?: string }> = memo(({ className = '' }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 ${className}`}>
    <div className="flex items-center space-x-4 mb-4">
      <SkeletonAvatar />
      <div className="flex-1">
        <SkeletonLoader height="1.25rem" width="60%" className="mb-2" />
        <SkeletonLoader height="1rem" width="40%" />
      </div>
    </div>
    <SkeletonText lines={3} />
  </div>
));

export const SkeletonTable: React.FC<{ 
  rows?: number; 
  columns?: number; 
  className?: string 
}> = memo(({ 
  rows = 5, 
  columns = 4, 
  className = '' 
}) => (
  <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden ${className}`}>
    {/* Table Header */}
    <div className="bg-gray-50 dark:bg-gray-700 px-6 py-3 border-b border-gray-200 dark:border-gray-600">
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, index) => (
          <SkeletonLoader key={index} height="1rem" width="80%" />
        ))}
      </div>
    </div>
    
    {/* Table Rows */}
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="px-6 py-4">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div key={colIndex} className="flex items-center">
                {colIndex === 0 ? (
                  <div className="flex items-center space-x-3">
                    <SkeletonAvatar size="sm" />
                    <SkeletonLoader height="1rem" width="120px" />
                  </div>
                ) : (
                  <SkeletonLoader 
                    height="1rem" 
                    width={colIndex === columns - 1 ? '60%' : '80%'} 
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
));

export const SkeletonCryptoTable: React.FC<{ className?: string }> = memo(({ className = '' }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}>
    {/* Desktop Table View */}
    <div className="hidden lg:block">
      <SkeletonTable rows={10} columns={6} className="shadow-none border-none rounded-none" />
    </div>

    {/* Mobile Card View */}
    <div className="lg:hidden divide-y divide-gray-200 dark:divide-gray-700">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <SkeletonAvatar />
              <div>
                <SkeletonLoader height="1.25rem" width="120px" className="mb-1" />
                <SkeletonLoader height="0.875rem" width="60px" />
              </div>
            </div>
            <div className="text-right">
              <SkeletonLoader height="1.5rem" width="80px" className="mb-1" />
              <SkeletonLoader height="1rem" width="60px" />
            </div>
          </div>
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
            <div>
              <SkeletonLoader height="0.875rem" width="80px" className="mb-1" />
              <SkeletonLoader height="1rem" width="100px" />
            </div>
            <div className="xs:text-right">
              <SkeletonLoader height="0.875rem" width="60px" className="mb-1" />
              <SkeletonLoader height="1rem" width="80px" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
));

SkeletonText.displayName = 'SkeletonText';
SkeletonAvatar.displayName = 'SkeletonAvatar';
SkeletonCard.displayName = 'SkeletonCard';
SkeletonTable.displayName = 'SkeletonTable';
SkeletonCryptoTable.displayName = 'SkeletonCryptoTable';

export default SkeletonLoader;