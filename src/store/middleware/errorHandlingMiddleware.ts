import { type Middleware } from '@reduxjs/toolkit';
import { fetchCoins, refreshPrices, searchCoins, retryLastFailedAction } from '../slices/cryptoSlice';

interface RetryState {
  lastFailedAction: any;
  retryCount: number;
  maxRetries: number;
}

const retryState: RetryState = {
  lastFailedAction: null,
  retryCount: 0,
  maxRetries: 3,
};

export const errorHandlingMiddleware: Middleware = (store) => (next) => (action: any) => {
  const result = next(action);

  if (retryLastFailedAction.match(action)) {
    if (retryState.lastFailedAction && retryState.retryCount < retryState.maxRetries) {
      retryState.retryCount++;
      
      // Add exponential backoff delay
      const delay = Math.pow(2, retryState.retryCount - 1) * 1000; // 1s, 2s, 4s
      
      setTimeout(() => {
        store.dispatch(retryState.lastFailedAction);
      }, delay);
    }
    return result;
  }

  if (action.type?.endsWith('/rejected')) {
    const errorPayload = action.payload as any;
    
    if (errorPayload?.canRetry) {
      if (action.type === fetchCoins.rejected.type) {
        retryState.lastFailedAction = fetchCoins(action.meta.arg);
      } else if (action.type === refreshPrices.rejected.type) {
        retryState.lastFailedAction = refreshPrices(action.meta.arg);
      } else if (action.type === searchCoins.rejected.type) {
        retryState.lastFailedAction = searchCoins(action.meta.arg);
      }
    }
  }

  if (action.type?.endsWith('/fulfilled')) {
    retryState.retryCount = 0;
    retryState.lastFailedAction = null;
  }

  return result;
};

export default errorHandlingMiddleware;