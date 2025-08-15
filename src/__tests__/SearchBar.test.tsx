import { describe, test, expect, vi } from 'vitest';
import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBar from '../components/common/SearchBar';
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
        <SearchBar placeholder="Search cryptocurrencies..." />
      </ToastProvider>
    </Provider>
  );
};

describe('SearchBar', () => {
  test('renders search input with placeholder', () => {
    renderWithStore({});
    expect(screen.getByPlaceholderText('Search cryptocurrencies...')).toBeInTheDocument();
  });

  test('updates search query on user input', async () => {
    const user = userEvent.setup();
    renderWithStore({});
    
    const searchInput = screen.getByPlaceholderText('Search cryptocurrencies...');
    await user.type(searchInput, 'bitcoin');
    
    expect(searchInput).toHaveValue('bitcoin');
  });

  test('debounces search input', async () => {
    vi.useFakeTimers();
    const user = userEvent.setup({ delay: null });
    renderWithStore({});
    
    const searchInput = screen.getByPlaceholderText('Search cryptocurrencies...');
    await user.type(searchInput, 'bitcoin');
    
    // Fast forward timers to trigger debounced search
    vi.advanceTimersByTime(300);
    
    expect(searchInput).toHaveValue('bitcoin');
    vi.useRealTimers();
  });
});
