import { configureStore } from '@reduxjs/toolkit';
import cryptoSlice from './slices/cryptoSlice';
import uiSlice from './slices/uiSlice';
import portfolioSlice from './slices/portfolioSlice';
import { refreshMiddleware } from './middleware/refreshMiddleware';
import { errorHandlingMiddleware } from './middleware/errorHandlingMiddleware';
import { toastMiddleware } from './middleware/toastMiddleware';

export const store = configureStore({
  reducer: {
    crypto: cryptoSlice,
    ui: uiSlice,
    portfolio: portfolioSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'crypto/refreshPrices/pending', 
          'crypto/refreshPrices/fulfilled',
          'crypto/fetchCoins/rejected',
          'crypto/refreshPrices/rejected',
          'crypto/searchCoins/rejected',
        ],
      },
    }).concat(refreshMiddleware, errorHandlingMiddleware, toastMiddleware),
  devTools: import.meta.env.DEV,
});

export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;