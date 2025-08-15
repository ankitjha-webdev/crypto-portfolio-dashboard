import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface FilterState {
  marketCapFilter: 'all' | 'top10' | 'top50';
  priceChangeFilter: 'all' | 'positive' | 'negative';
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export interface UIState {
  searchQuery: string;
  filters: FilterState;
  theme: 'light' | 'dark';
  sortConfig: SortConfig;
}

const loadPersistedState = (): Partial<UIState> => {
  try {
    const persistedFilters = localStorage.getItem('crypto-dashboard-filters');
    const persistedTheme = localStorage.getItem('crypto-dashboard-theme');
    const persistedSort = localStorage.getItem('crypto-dashboard-sort');

    return {
      filters: persistedFilters ? JSON.parse(persistedFilters) : undefined,
      theme: persistedTheme as 'light' | 'dark' || undefined,
      sortConfig: persistedSort ? JSON.parse(persistedSort) : undefined,
    };
  } catch (error) {
    console.warn('Failed to load persisted UI state:', error);
    return {};
  }
};

const saveToLocalStorage = (key: string, value: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Failed to save ${key} to localStorage:`, error);
  }
};

const persistedState = loadPersistedState();

const initialState: UIState = {
  searchQuery: '',
  filters: persistedState.filters || {
    marketCapFilter: 'all',
    priceChangeFilter: 'all',
  },
  theme: persistedState.theme || 'light',
  sortConfig: persistedState.sortConfig || {
    key: 'market_cap_rank',
    direction: 'asc',
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    clearSearch: (state) => {
      state.searchQuery = '';
    },
    setMarketCapFilter: (state, action: PayloadAction<'all' | 'top10' | 'top50'>) => {
      state.filters.marketCapFilter = action.payload;
      saveToLocalStorage('crypto-dashboard-filters', state.filters);
    },
    setPriceChangeFilter: (state, action: PayloadAction<'all' | 'positive' | 'negative'>) => {
      state.filters.priceChangeFilter = action.payload;
      saveToLocalStorage('crypto-dashboard-filters', state.filters);
    },
    setFilters: (state, action: PayloadAction<FilterState>) => {
      state.filters = action.payload;
      saveToLocalStorage('crypto-dashboard-filters', state.filters);
    },
    clearFilters: (state) => {
      state.filters = {
        marketCapFilter: 'all',
        priceChangeFilter: 'all',
      };
      saveToLocalStorage('crypto-dashboard-filters', state.filters);
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      saveToLocalStorage('crypto-dashboard-theme', state.theme);
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
      saveToLocalStorage('crypto-dashboard-theme', state.theme);
    },
    setSortConfig: (state, action: PayloadAction<SortConfig>) => {
      state.sortConfig = action.payload;
      saveToLocalStorage('crypto-dashboard-sort', state.sortConfig);
    },
    toggleSort: (state, action: PayloadAction<string>) => {
      const key = action.payload;
      if (state.sortConfig.key === key) {
        state.sortConfig.direction = state.sortConfig.direction === 'asc' ? 'desc' : 'asc';
      } else {
        // Set new key with default direction
        state.sortConfig = {
          key,
          direction: 'asc',
        };
      }
      saveToLocalStorage('crypto-dashboard-sort', state.sortConfig);
    },
    resetUIState: (state) => {
      state.searchQuery = '';
      state.filters = {
        marketCapFilter: 'all',
        priceChangeFilter: 'all',
      };
      state.sortConfig = {
        key: 'market_cap_rank',
        direction: 'asc',
      };
      localStorage.removeItem('crypto-dashboard-filters');
      localStorage.removeItem('crypto-dashboard-sort');
    },
  },
});

export const {
  setSearchQuery,
  clearSearch,
  setMarketCapFilter,
  setPriceChangeFilter,
  setFilters,
  clearFilters,
  toggleTheme,
  setTheme,
  setSortConfig,
  toggleSort,
  resetUIState,
} = uiSlice.actions;

export default uiSlice.reducer;

