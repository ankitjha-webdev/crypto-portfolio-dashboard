import type { Middleware } from '@reduxjs/toolkit';
import { refreshPrices, selectCoinIds, selectLastUpdated, updateRateLimitStatus } from '../slices/cryptoSlice';
import { coinGeckoApi } from '../../services/coinGeckoApi';
import { isDataStale } from '../../utils/dataTransformers';

const REFRESH_INTERVAL = 30000; // 30 seconds
const MAX_DATA_AGE = 30000; // 30 seconds

interface RefreshMiddlewareState {
  intervalId: number | null;
  isDocumentVisible: boolean;
  lastRefreshTime: number;
}

const refreshState: RefreshMiddlewareState = {
  intervalId: null,
  isDocumentVisible: true,
  lastRefreshTime: 0,
};

export const refreshMiddleware: Middleware = (store) => {
  const handleVisibilityChange = () => {
    refreshState.isDocumentVisible = !document.hidden;
    
    if (refreshState.isDocumentVisible) {
      const state = store.getState() as any;
      const lastUpdated = selectLastUpdated(state);
      
      if (isDataStale(lastUpdated, MAX_DATA_AGE)) {
        const coinIds = selectCoinIds(state);
        if (coinIds.length > 0) {
          store.dispatch(refreshPrices(coinIds) as any);
        }
      }
      
      startAutoRefresh(store);
    } else {
      stopAutoRefresh();
    }
  };

  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', handleVisibilityChange);
  }

  startAutoRefresh(store);

  return (next) => (action: unknown) => {
    const result = next(action);

    if (action && typeof action === 'object' && 'type' in action && typeof action.type === 'string' && action.type.startsWith('crypto/') && action.type.includes('fulfilled')) {
      const rateLimitStatus = coinGeckoApi.getRateLimitStatus();
      store.dispatch(updateRateLimitStatus(rateLimitStatus));
    }

    if (action && typeof action === 'object' && 'type' in action && action.type === 'crypto/fetchCoins/fulfilled') {
      startAutoRefresh(store);
    }

    return result;
  };
};

const startAutoRefresh = (store: any) => {
  if (refreshState.intervalId) {
    clearInterval(refreshState.intervalId);
  }

  refreshState.intervalId = setInterval(() => {
    if (!refreshState.isDocumentVisible) {
      return;
    }

    const state = store.getState() as any;
    const coinIds = selectCoinIds(state);
    const lastUpdated = selectLastUpdated(state);

    const rateLimitStatus = coinGeckoApi.getRateLimitStatus();
    if (rateLimitStatus.remaining <= 0) {
      console.warn('Rate limit reached, skipping refresh');
      return;
    }

    if (coinIds.length > 0 && isDataStale(lastUpdated, MAX_DATA_AGE)) {
      const now = Date.now();
      
      // Prevent too frequent refreshes
      if (now - refreshState.lastRefreshTime >= REFRESH_INTERVAL) {
        refreshState.lastRefreshTime = now;
        store.dispatch(refreshPrices(coinIds) as any);
      }
    }
  }, REFRESH_INTERVAL);
};

const stopAutoRefresh = () => {
  if (refreshState.intervalId) {
    clearInterval(refreshState.intervalId);
    refreshState.intervalId = null;
  }
};

export const cleanupRefreshMiddleware = () => {
  stopAutoRefresh();
  
  if (typeof document !== 'undefined') {
    document.removeEventListener('visibilitychange', () => {});
  }
};

export default refreshMiddleware;