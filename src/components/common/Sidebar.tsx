import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAppSelector } from '../../hooks/useAppSelector';
import ThemeToggle from './ThemeToggle';

interface SidebarProps {
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  className = '',
  isOpen = true,
  onClose
}) => {
  const theme = useAppSelector(state => state.ui.theme);
  
  return (
    <>
      {/* Desktop Sidebar */}
      <div 
        className={`
          fixed top-0 left-0 h-full bg-white dark:bg-gray-800 shadow-lg border-r border-gray-200 dark:border-gray-700
          transition-all duration-300 ease-in-out z-50
          w-64 hidden lg:block
          ${className}
        `}
      >
        {/* Logo and Brand */}
        <div className="flex items-center space-x-2 px-6 py-6 border-b border-gray-200 dark:border-gray-700">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          Crypto DP
          </h1>
        </div>
        
        {/* Navigation Links */}
         <nav className="px-4 py-6">
           <ul className="space-y-2">
             <li>
               <NavLink
                 to="/dashboard"
                 className={({ isActive }) =>
                   `flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                     ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 shadow-sm'
                     : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50'
                   }`
                 }
               >
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                 </svg>
                 <span>Dashboard</span>
               </NavLink>
             </li>
             <li>
               <NavLink
                 to="/portfolio"
                 className={({ isActive }) =>
                   `flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                     ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 shadow-sm'
                     : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50'
                   }`
                 }
               >
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                 </svg>
                 <span>Portfolio</span>
               </NavLink>
             </li>
           </ul>
         </nav>
        
        {/* Bottom Section with Theme Toggle */}
        <div className="absolute bottom-0 left-0 right-0 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <ThemeToggle showLabel={true} size="md" />
        </div>
      </div>
      
      {/* Mobile Sidebar Overlay - Only visible when isOpen is true on small screens */}
      <div 
        className={`
          fixed inset-0 bg-gray-900 bg-opacity-50 z-40 lg:hidden
          transition-opacity duration-300 ease-in-out
          ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
        onClick={onClose}
      />
      
      {/* Mobile Sidebar - Slides in from left */}
      <div 
        className={`
          fixed top-0 left-0 h-full bg-white dark:bg-gray-800 shadow-lg border-r border-gray-200 dark:border-gray-700
          transition-all duration-300 ease-in-out z-50 lg:hidden
          w-64 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Close Button */}
        <div className="absolute top-4 right-4">
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            aria-label="Close sidebar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Logo and Brand */}
        <div className="flex items-center space-x-2 px-6 py-6 border-b border-gray-200 dark:border-gray-700">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          Crypto DP
          </h1>
        </div>
        
        {/* Mobile sidebar content */}
        <div className="px-6 py-8 lg:hidden">
          <div className="text-center">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Crypto Portfolio Dashboard</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Manage your crypto investments in one place
            </p>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Use the bottom navigation bar to switch between Dashboard and Portfolio views.
              </p>
            </div>
          </div>
        </div>
        
        {/* Bottom Section with Theme Toggle */}
        <div className="absolute bottom-0 left-0 right-0 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <ThemeToggle showLabel={true} size="md" />
        </div>
      </div>
    </>
  );
};

Sidebar.displayName = 'Sidebar';

export default Sidebar;