import { useState, useEffect } from 'react';
import { useToast } from '../components/common/ToastContainer';

interface UseNetworkStatusOptions {
  showToastNotifications?: boolean;
}

interface NetworkStatus {
  isOnline: boolean;
  isSlowConnection: boolean;
  connectionType: string;
}

export const useNetworkStatus = (options: UseNetworkStatusOptions = {}) => {
  const { showToastNotifications = false } = options;
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: navigator.onLine,
    isSlowConnection: false,
    connectionType: 'unknown',
  });
  
  const { showWarning, showInfo } = useToast();

  useEffect(() => {
    const updateNetworkStatus = () => {
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      
      setNetworkStatus({
        isOnline: navigator.onLine,
        isSlowConnection: connection ? connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g' : false,
        connectionType: connection ? connection.effectiveType : 'unknown',
      });
    };

    const handleOnline = () => {
      updateNetworkStatus();
      if (showToastNotifications) {
        showInfo('Connection Restored', 'You are back online. Data will be refreshed automatically.');
      }
    };

    const handleOffline = () => {
      updateNetworkStatus();
      if (showToastNotifications) {
        showWarning('Connection Lost', 'You are offline. Some features may not work properly.');
      }
    };

    const handleConnectionChange = () => {
      updateNetworkStatus();
    };

    updateNetworkStatus();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (connection) {
      connection.addEventListener('change', handleConnectionChange);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if (connection) {
        connection.removeEventListener('change', handleConnectionChange);
      }
    };
  }, [showWarning, showInfo]);

  return networkStatus;
};

export default useNetworkStatus;