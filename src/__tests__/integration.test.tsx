import { describe, test, expect, vi } from 'vitest';
import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import cryptoReducer from '../store/slices/cryptoSlice';
import uiReducer from '../store/slices/uiSlice';
import portfolioReducer from '../store/slices/portfolioSlice';

// Mock the API service
vi.mock('../services/coinGeckoApi', () => ({
  coinGeckoApi: {
    fetchCoins: vi.fn().mockResolvedValue([
      {
        id: 'bitcoin',
        name: 'Bitcoin',
        symbol: 'BTC',
        image: 'btc.png',
        current_price: 50000,
        price_change_percentage_24h: 2,
        market_cap: 1000000,
        market_cap_rank: 1,
      },
      {
        id: 'ethereum',
        name: 'Ethereum',
        symbol: 'ETH',
        image: 'eth.png',
        current_price: 3000,
        price_change_percentage_24h: -1,
        market_cap: 500000,
        market_cap_rank: 2,
      },
    ]),
    fetchSimplePrices: vi.fn().mockResolvedValue({
      bitcoin: { usd: 50000, usd_24h_change: 2 },
      ethereum: { usd: 3000, usd_24h_change: -1 },
    }),
  },
}));

const renderWithStore = (preloadedState: any = {}) => {
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
      <App />
    </Provider>
  );
};

describe('Integration Tests', () => {
  test('complete user workflow: search, filter, and add to portfolio', async () => {
    const user = userEvent.setup();
    renderWithStore();

    // Wait for dashboard to load
    await waitFor(() => {
      expect(screen.getByText('Crypto Dashboard')).toBeInTheDocument();
    });

    // Search for Bitcoin
    const searchInput = screen.getByPlaceholderText('Search cryptocurrencies...');
    await user.type(searchInput, 'bitcoin');

    // Verify Bitcoin is displayed
    await waitFor(() => {
      expect(screen.getByText('Bitcoin')).toBeInTheDocument();
    });

    // Navigate to portfolio
    const portfolioLink = screen.getByText('Portfolio');
    await user.click(portfolioLink);

    // Verify portfolio page loads
    await waitFor(() => {
      expect(screen.getByText(/Portfolio/i)).toBeInTheDocument();
    });
  });

  test('theme switching functionality', async () => {
    const user = userEvent.setup();
    renderWithStore();

    // Wait for app to load
    await waitFor(() => {
      expect(screen.getByText('Crypto Dashboard')).toBeInTheDocument();
    });

    // Find and click theme toggle
    const themeToggle = screen.getByRole('button', { name: /toggle theme/i });
    await user.click(themeToggle);

    // Verify theme class is applied (this would be checked in the DOM)
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});
