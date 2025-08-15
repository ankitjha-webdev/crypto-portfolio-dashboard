import { useCallback } from 'react';
import { useToast } from '../components/common/ToastContainer';

interface ErrorHandlerOptions {
  showToast?: boolean;
  logToConsole?: boolean;
  context?: string;
}

interface ApiError {
  message: string;
  code?: string | number;
  timestamp?: number;
  canRetry?: boolean;
  originalMessage?: string;
}

export const useErrorHandler = () => {
  const { showError, showWarning } = useToast();

  const handleError = useCallback((
    error: unknown,
    options: ErrorHandlerOptions = {}
  ) => {
    const {
      showToast = true,
      logToConsole = true,
      context = 'Application'
    } = options;

    let errorMessage = 'An unexpected error occurred';
    let errorTitle = 'Error';
    let isWarning = false;

    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error && typeof error === 'object') {
      const apiError = error as ApiError;
      errorMessage = apiError.message || errorMessage;
      
      if (apiError.code === 429) {
        errorTitle = 'Rate Limited';
        isWarning = true;
      } else if (apiError.code === 503 || apiError.code === 502) {
        errorTitle = 'Service Unavailable';
        isWarning = true;
      } else if (apiError.message?.includes('network') || apiError.message?.includes('fetch')) {
        errorTitle = 'Connection Error';
        isWarning = true;
        (apiError as any).isNetworkError = true;
      }
    }

    if (logToConsole) {
      console.error(`[${context}] Error:`, error);
    }

    if (showToast) {
      if (isWarning) {
        showWarning(errorTitle, errorMessage);
      } else {
        showError(errorTitle, errorMessage);
      }
    }

    return {
      message: errorMessage,
      title: errorTitle,
      isWarning,
    };
  }, [showError, showWarning]);

  const handleAsyncError = useCallback(async <T>(
    asyncOperation: () => Promise<T>,
    options: ErrorHandlerOptions & { 
      fallbackValue?: T;
      retryCount?: number;
    } = {}
  ): Promise<T | undefined> => {
    const { fallbackValue, retryCount = 0, ...errorOptions } = options;
    
    let lastError: unknown;
    
    for (let attempt = 0; attempt <= retryCount; attempt++) {
      try {
        return await asyncOperation();
      } catch (error) {
        lastError = error;
        
        if (error && typeof error === 'object') {
          const apiError = error as ApiError;
          if (apiError.code === 400 || apiError.code === 401 || apiError.code === 403 || apiError.code === 404) {
            break;
          }
        }
        
        if (attempt < retryCount) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }
    
    handleError(lastError, {
      ...errorOptions,
      context: `${errorOptions.context || 'Async Operation'} (${retryCount + 1} attempts)`,
    });
    
    return fallbackValue;
  }, [handleError]);

  const handleValidationError = useCallback((
    field: string,
    value: unknown,
    rules: {
      required?: boolean;
      min?: number;
      max?: number;
      pattern?: RegExp;
      custom?: (value: unknown) => string | null;
    }
  ): string | null => {
    const { required, min, max, pattern, custom } = rules;
    
    if (required && (!value || (typeof value === 'string' && !value.trim()))) {
      return `${field} is required`;
    }
    
    if (!value && !required) {
      return null;
    }
    
    if (typeof value === 'number' || (typeof value === 'string' && !isNaN(Number(value)))) {
      const numValue = Number(value);
      
      if (min !== undefined && numValue < min) {
        return `${field} must be at least ${min}`;
      }
      
      if (max !== undefined && numValue > max) {
        return `${field} must be at most ${max}`;
      }
    }
    
    if (pattern && typeof value === 'string' && !pattern.test(value)) {
      return `${field} format is invalid`;
    }
    
    if (custom) {
      return custom(value);
    }
    
    return null;
  }, []);

  return {
    handleError,
    handleAsyncError,
    handleValidationError,
  };
};

export default useErrorHandler;