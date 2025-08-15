import { type Middleware } from '@reduxjs/toolkit';
import { fetchCoins, refreshPrices, searchCoins, fetchCoinDetails } from '../slices/cryptoSlice';
import { addHolding, updateHolding, removeHolding } from '../slices/portfolioSlice';

interface ToastNotification {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

let globalToastHandler: ((toast: ToastNotification) => void) | null = null;

export const setGlobalToastHandler = (handler: (toast: ToastNotification) => void) => {
  globalToastHandler = handler;
};

export const toastMiddleware: Middleware = (store) => (next) => (action: any) => {
  const result = next(action);

  if (!globalToastHandler) {
    return result;
  }

  if (action.type?.endsWith('/fulfilled')) {
    if (action.type === addHolding.type) {
      globalToastHandler({
        type: 'success',
        title: 'Holding Added',
        message: 'Cryptocurrency holding has been added to your portfolio.',
      });
    } else if (action.type === updateHolding.type) {
      globalToastHandler({
        type: 'success',
        title: 'Holding Updated',
        message: 'Your cryptocurrency holding has been updated.',
      });
    } else if (action.type === removeHolding.type) {
      globalToastHandler({
        type: 'success',
        title: 'Holding Removed',
        message: 'Cryptocurrency holding has been removed from your portfolio.',
      });
    } else if (fetchCoins.fulfilled.match(action)) {
      // Only show success toast on initial load, not on refreshes
      const state = store.getState() as any;
      if (state.crypto.coinIds.length === 0) {
        globalToastHandler({
          type: 'success',
          title: 'Data Loaded',
          message: 'Cryptocurrency data has been loaded successfully.',
          duration: 3000,
        });
      }
    }
  }

  if (action.type?.endsWith('/rejected')) {
    const errorPayload = action.payload as any;
    
    if (errorPayload?.isSilent) {
      return result;
    }

    if (fetchCoins.rejected.match(action)) {
      globalToastHandler({
        type: 'error',
        title: 'Failed to Load Data',
        message: errorPayload?.message || 'Unable to fetch cryptocurrency data.',
        duration: 7000,
      });
    } else if (refreshPrices.rejected.match(action)) {
      globalToastHandler({
        type: 'warning',
        title: 'Price Update Failed',
        message: errorPayload?.message || 'Unable to refresh prices. Using cached data.',
        duration: 5000,
      });
    } else if (searchCoins.rejected.match(action)) {
      globalToastHandler({
        type: 'error',
        title: 'Search Failed',
        message: errorPayload?.message || 'Unable to search cryptocurrencies.',
        duration: 5000,
      });
    } else if (fetchCoinDetails.rejected.match(action)) {
      globalToastHandler({
        type: 'error',
        title: 'Details Unavailable',
        message: errorPayload?.message || 'Unable to fetch coin details.',
        duration: 5000,
      });
    }
  }

  if (action.type === addHolding.type) {
    const { coinId, amount } = action.payload;
    if (!coinId || amount <= 0) {
      globalToastHandler({
        type: 'error',
        title: 'Invalid Holding',
        message: 'Please select a valid cryptocurrency and enter a positive amount.',
      });
    }
  }

  return result;
};

export default toastMiddleware;