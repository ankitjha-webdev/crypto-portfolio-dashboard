import React from 'react';
import { NavLink } from 'react-router-dom';

interface MobileNavigationProps {
  className?: string;
  onOpenSidebar?: () => void;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({
  className = '',
  onOpenSidebar
}) => {
  return (
    <div className={`
      fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 
      shadow-lg lg:hidden z-40 ${className}
    `}>
      <div className="flex items-center justify-around h-16 px-4">
        {/* Menu Button */}
        {/* <button
          onClick={onOpenSidebar}
          className="flex flex-col items-center justify-center w-16 h-full text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
          aria-label="Open menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <span className="text-xs mt-1">Menu</span>
        </button> */}

        {/* Dashboard Link */}
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-16 h-full transition-colors ${isActive
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
            }`
          }
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span className="text-xs mt-1">Dashboard</span>
        </NavLink>

        {/* Portfolio Link */}
        <NavLink
          to="/portfolio"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-16 h-full transition-colors ${isActive
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
            }`
          }
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          <span className="text-xs mt-1">Portfolio</span>
        </NavLink>
      </div>
    </div>
  );
};

MobileNavigation.displayName = 'MobileNavigation';

export default MobileNavigation;