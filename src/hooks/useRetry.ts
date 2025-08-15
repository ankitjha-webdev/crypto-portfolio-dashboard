import { useState, useCallback } from 'react';
import { useToast } from '../components/common/ToastContainer';

interface RetryOptions {
  maxAttempts?: number;
  delay?: number;
  backoffMultiplier?: number;
  showToast?: boolean;
}

interface RetryState {
  isRetrying: boolean;
  attemptCount: number;
  lastError: Error | null;
}

export const useRetry = () => {
  const [retryState, setRetryState] = useState<RetryState>({
    isRetrying: false,
    attemptCount: 0,
    lastError: null,
  });

  const { showError, showSuccess, showInfo } = useToast();

  const retry = useCallback(async <T>(
    operation: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T | null> => {
    const {
      maxAttempts = 3,
      delay = 1000,
      backoffMultiplier = 2,
      showToast = true,
    } = options;

    setRetryState({
      isRetrying: true,
      attemptCount: 0,
      lastError: null,
    });

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        setRetryState(prev => ({ ...prev, attemptCount: attempt }));

        const result = await operation();

        // Success
        setRetryState({
          isRetrying: false,
          attemptCount: attempt,
          lastError: null,
        });

        if (showToast && attempt > 1) {
          showSuccess('Operation Successful', `Succeeded after ${attempt} attempts.`);
        }

        return result;
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error(String(error));
        
        setRetryState(prev => ({
          ...prev,
          lastError: errorObj,
        }));

        if (attempt === maxAttempts) {
          setRetryState(prev => ({ ...prev, isRetrying: false }));
          
          if (showToast) {
            showError(
              'Operation Failed',
              `Failed after ${maxAttempts} attempts. ${errorObj.message}`
            );
          }
          
          throw errorObj;
        }

        // Wait before next attempt with exponential backoff
        const waitTime = delay * Math.pow(backoffMultiplier, attempt - 1);
        
        if (showToast) {
          showInfo(
            'Retrying...',
            `Attempt ${attempt} failed. Retrying in ${Math.round(waitTime / 1000)} seconds...`
          );
        }

        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }

    return null;
  }, [showError, showSuccess, showInfo]);

  const retryWithExponentialBackoff = useCallback(async <T>(
    operation: () => Promise<T>,
    maxAttempts: number = 3
  ): Promise<T | null> => {
    return retry(operation, {
      maxAttempts,
      delay: 1000,
      backoffMultiplier: 2,
      showToast: true,
    });
  }, [retry]);

  const retryWithLinearBackoff = useCallback(async <T>(
    operation: () => Promise<T>,
    maxAttempts: number = 3,
    delay: number = 2000
  ): Promise<T | null> => {
    return retry(operation, {
      maxAttempts,
      delay,
      backoffMultiplier: 1,
      showToast: true,
    });
  }, [retry]);

  const silentRetry = useCallback(async <T>(
    operation: () => Promise<T>,
    maxAttempts: number = 3
  ): Promise<T | null> => {
    return retry(operation, {
      maxAttempts,
      delay: 1000,
      backoffMultiplier: 2,
      showToast: false,
    });
  }, [retry]);

  const reset = useCallback(() => {
    setRetryState({
      isRetrying: false,
      attemptCount: 0,
      lastError: null,
    });
  }, []);

  return {
    retry,
    retryWithExponentialBackoff,
    retryWithLinearBackoff,
    silentRetry,
    reset,
    ...retryState,
  };
};

export default useRetry;