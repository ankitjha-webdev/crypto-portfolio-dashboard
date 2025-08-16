import { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store';
import Dashboard from './pages/Dashboard';
import Portfolio from './pages/Portfolio';
import { ThemeToggle, ErrorBoundary, ToastProvider, Sidebar, MobileNavigation } from './components/common';
import { useThemeInitialization } from './hooks/useThemeInitialization';
import { useNetworkStatus } from './hooks/useNetworkStatus';

function AppContent() {
  useThemeInitialization();
  const networkStatus = useNetworkStatus({ showToastNotifications: false });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleOpenSidebar = () => setSidebarOpen(true);
  const handleCloseSidebar = () => setSidebarOpen(false);

  useEffect(() => {
    document.body.className = 'bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors';
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        {/* Desktop Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={handleCloseSidebar} />
        
        {/* Mobile Navigation */}
        <MobileNavigation onOpenSidebar={handleOpenSidebar} />
        
        {/* Mobile Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30 lg:hidden">
          <div className="px-4 flex justify-between items-center h-16">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" />
                </svg>
              </div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">Crypto DP</h1>
            </div>
            
            {/* Theme Toggle */}
            <ThemeToggle size="md" />
          </div>
        </header>

        {/* Network Status Indicator */}
        {!networkStatus.isOnline && (
          <div className="bg-red-600 text-white px-4 py-2 text-center text-sm">
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
              </svg>
              <span>You are offline. Some features may not work properly.</span>
            </div>
          </div>
        )}

        {networkStatus.isSlowConnection && networkStatus.isOnline && (
          <div className="bg-yellow-600 text-white px-4 py-2 text-center text-sm">
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span>Slow connection detected. Data may load slowly.</span>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="lg:pl-64 pb-16 lg:pb-0">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/portfolio" element={<Portfolio />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function App() {
  return (
    <Provider store={store}>
      <ErrorBoundary>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </ErrorBoundary>
    </Provider>
  );
}

export default App;
