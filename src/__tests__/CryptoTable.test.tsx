import { describe, test, expect } from 'vitest';
import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { render, screen } from '@testing-library/react';
import CryptoTable from '../components/dashboard/CryptoTable';
import cryptoReducer from '../store/slices/cryptoSlice';
import uiReducer from '../store/slices/uiSlice';
import portfolioReducer from '../store/slices/portfolioSlice';

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
      <CryptoTable />
    </Provider>
  );
};

describe('CryptoTable', () => {
  test('renders coin names from store', () => {
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
          ethereum: {
            id: 'ethereum',
            name: 'Ethereum',
            symbol: 'ETH',
            image: 'eth.png',
            current_price: 3000,
            price_change_percentage_24h: -1,
            market_cap: 500000,
            market_cap_rank: 2,
          },
        },
        coinIds: ['bitcoin', 'ethereum'],
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
        holdings: {},
        totalValue: 0,
        totalChange24h: 0,
        totalChangePercentage24h: 0,
        lastCalculated: 0,
      },
    };

    renderWithStore(preloadedState);

    // Use getAllByText to handle multiple elements with same text
    const bitcoinElements = screen.getAllByText('Bitcoin');
    const ethereumElements = screen.getAllByText('Ethereum');
    
    expect(bitcoinElements.length).toBeGreaterThan(0);
    expect(ethereumElements.length).toBeGreaterThan(0);
  });
});


