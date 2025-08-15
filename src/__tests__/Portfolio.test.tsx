import { describe, test, expect } from 'vitest';
import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { render, screen } from '@testing-library/react';
import Portfolio from '../pages/Portfolio';
import cryptoReducer from '../store/slices/cryptoSlice';
import uiReducer from '../store/slices/uiSlice';
import portfolioReducer from '../store/slices/portfolioSlice';
import { ToastProvider } from '../components/common/ToastContainer';

const renderWithStore = (preloadedState: any) => {
  const store = configureStore({
    reducer: { 
      crypto: cryptoReducer, 
      ui: uiReducer,
      portfolio: portfolioReducer
    },
    preloadedState,
  });
  return render(
    <Provider store={store}>
      <ToastProvider>
        <Portfolio />
      </ToastProvider>
    </Provider>
  );
};

describe('Portfolio', () => {
  test('renders portfolio page with empty state', () => {
    const preloadedState = {
      crypto: {
        coins: {},
        coinIds: [],
        loading: false,
        refreshing: false,
        searching: false,
        error: null,
        lastUpdated: 0,
        searchResults: [],
        rateLimitStatus: { remaining: 10, resetTime: Date.now() + 60000 },
      },
      ui: {
        searchQuery: '',
        filters: { marketCapFilter: 'all', priceChangeFilter: 'all' },
        theme: 'light',
        sortConfig: { key: 'market_cap_rank', direction: 'asc' },
      },
      portfolio: {
        holdings: {},
        totalValue: 0,
        totalChange24h: 0,
        totalChangePercentage24h: 0,
        lastCalculated: 0,
      },
    };

    renderWithStore(preloadedState);
    
    expect(screen.getByText(/Portfolio/i)).toBeInTheDocument();
  });

  test('renders portfolio with holdings', () => {
    const preloadedState = {
      crypto: {
        coins: {
          bitcoin: {
            id: 'bitcoin',
            name: 'Bitcoin',
            symbol: 'BTC',
            image: 'btc.png',
            current_price: 50000,
            price_change_percentage_24h: 2,
            market_cap: 1000000,
            market_cap_rank: 1,
          },
        },
        coinIds: ['bitcoin'],
        loading: false,
        refreshing: false,
        searching: false,
        error: null,
        lastUpdated: Date.now(),
        searchResults: [],
        rateLimitStatus: { remaining: 10, resetTime: Date.now() + 60000 },
      },
      ui: {
        searchQuery: '',
        filters: { marketCapFilter: 'all', priceChangeFilter: 'all' },
        theme: 'light',
        sortConfig: { key: 'market_cap_rank', direction: 'asc' },
      },
      portfolio: {
        holdings: {
          bitcoin: {
            coinId: 'bitcoin',
            amount: 1,
            averageBuyPrice: 45000,
            dateAdded: Date.now(),
          },
        },
        totalValue: 50000,
        totalChange24h: 1000,
        totalChangePercentage24h: 2,
        lastCalculated: Date.now(),
      },
    };

    renderWithStore(preloadedState);
    
    expect(screen.getByText('Bitcoin')).toBeInTheDocument();
  });
});
