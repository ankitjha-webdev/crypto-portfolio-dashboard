import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { coinGeckoApi, type ApiError } from '../../services/coinGeckoApi';

export interface CoinData {
  id: string;
  name: string;
  symbol: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  market_cap_rank: number;
}

export interface SearchResult {
  id: string;
  name: string;
  symbol: string;
  thumb: string;
  market_cap_rank: number;
}

export interface CryptoState {
  coins: Record<string, CoinData>; // Normalized by coin ID
  coinIds: string[]; // For maintaining order
  loading: boolean;
  refreshing: boolean;
  searching: boolean;
  error: string | null;
  lastUpdated: number;
  searchResults: SearchResult[];
  rateLimitStatus: {
    remaining: number;
    resetTime: number;
  };
}

const initialState: CryptoState = {
  coins: {},
  coinIds: [],
  loading: false,
  refreshing: false,
  searching: false,
  error: null,
  lastUpdated: 0,
  searchResults: [],
  rateLimitStatus: {
    remaining: 10,
    resetTime: Date.now() + 60000,
  },
};

export const fetchCoins = createAsyncThunk(
  'crypto/fetchCoins',
  async (limit: number = 50, { rejectWithValue }) => {
    try {
      const data = await coinGeckoApi.fetchCoins(limit);
      return data;
    } catch (error) {
      const apiError = error as ApiError;
      
      let userMessage = 'Failed to fetch cryptocurrency data';
      
      if (apiError.code === 429) {
        userMessage = 'Rate limit exceeded. Please wait a moment before refreshing.';
      } else if (apiError.code === 503 || apiError.code === 502) {
        userMessage = 'CoinGecko service is temporarily unavailable. Please try again later.';
      } else if (apiError.message?.includes('fetch')) {
        userMessage = 'Network connection error. Please check your internet connection.';
      } else if (apiError.code === 404) {
        userMessage = 'Cryptocurrency data not found.';
      }
      
      return rejectWithValue({
        message: userMessage,
        originalMessage: apiError.message,
        code: apiError.code,
        timestamp: apiError.timestamp,
        retryAfter: apiError.retryAfter,
        canRetry: [429, 503, 502, 500].includes(apiError.code as number) || apiError.message?.includes('fetch'),
      });
    }
  }
);

export const refreshPrices = createAsyncThunk(
  'crypto/refreshPrices',
  async (coinIds: string[], { rejectWithValue }) => {
    try {
      const data = await coinGeckoApi.fetchSimplePrices(coinIds);
      return data;
    } catch (error) {
      const apiError = error as ApiError;
      
      let userMessage = 'Failed to refresh prices';
      
      if (apiError.code === 429) {
        userMessage = 'Rate limit reached. Price updates paused temporarily.';
      } else if (apiError.code === 503 || apiError.code === 502) {
        userMessage = 'Service temporarily unavailable. Using cached prices.';
      } else if (apiError.message?.includes('fetch')) {
        userMessage = 'Connection issue. Price updates will resume automatically.';
      }
      
      return rejectWithValue({
        message: userMessage,
        originalMessage: apiError.message,
        code: apiError.code,
        timestamp: apiError.timestamp,
        retryAfter: apiError.retryAfter,
        canRetry: true,
        isSilent: true, // Don't show toast for refresh failures
      });
    }
  }
);

export const fetchCoinDetails = createAsyncThunk(
  'crypto/fetchCoinDetails',
  async (coinId: string, { rejectWithValue }) => {
    try {
      const data = await coinGeckoApi.fetchCoinDetails(coinId);
      return data;
    } catch (error) {
      const apiError = error as ApiError;
      return rejectWithValue({
        message: apiError.message,
        code: apiError.code,
        timestamp: apiError.timestamp,
        retryAfter: apiError.retryAfter,
      });
    }
  }
);

export const searchCoins = createAsyncThunk(
  'crypto/searchCoins',
  async (query: string, { rejectWithValue }) => {
    try {
      const data = await coinGeckoApi.searchCoins(query);
      return data;
    } catch (error) {
      const apiError = error as ApiError;
      
      let userMessage = 'Search failed';
      
      if (apiError.code === 429) {
        userMessage = 'Too many search requests. Please wait a moment.';
      } else if (apiError.code === 503 || apiError.code === 502) {
        userMessage = 'Search service temporarily unavailable.';
      } else if (apiError.message?.includes('fetch')) {
        userMessage = 'Network error during search. Please try again.';
      } else if (query.length < 2) {
        userMessage = 'Please enter at least 2 characters to search.';
      }
      
      return rejectWithValue({
        message: userMessage,
        originalMessage: apiError.message,
        code: apiError.code,
        timestamp: apiError.timestamp,
        retryAfter: apiError.retryAfter,
        canRetry: [429, 503, 502, 500].includes(apiError.code as number) || apiError.message?.includes('fetch'),
      });
    }
  }
);

const normalizeCoins = (coins: CoinData[]) => {
  const normalized: Record<string, CoinData> = {};
  const ids: string[] = [];
  
  coins.forEach(coin => {
    normalized[coin.id] = coin;
    ids.push(coin.id);
  });
  
  return { normalized, ids };
};

const cryptoSlice = createSlice({
  name: 'crypto',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateCoinPrice: (state, action: PayloadAction<{ id: string; price: number; change24h: number }>) => {
      const { id, price, change24h } = action.payload;
      if (state.coins[id]) {
        state.coins[id].current_price = price;
        state.coins[id].price_change_percentage_24h = change24h;
      }
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
    updateRateLimitStatus: (state, action: PayloadAction<{ remaining: number; resetTime: number }>) => {
      state.rateLimitStatus = action.payload;
    },
    retryLastFailedAction: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchCoins cases
      .addCase(fetchCoins.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCoins.fulfilled, (state, action) => {
        state.loading = false;
        const { normalized, ids } = normalizeCoins(action.payload);
        state.coins = normalized;
        state.coinIds = ids;
        state.lastUpdated = Date.now();
        state.error = null;
      })
      .addCase(fetchCoins.rejected, (state, action) => {
        state.loading = false;
        const errorPayload = action.payload as any;
        state.error = errorPayload?.message || 'Failed to fetch coins';
        
        if (errorPayload) {
          state.error = {
            message: errorPayload.message,
            code: errorPayload.code,
            canRetry: errorPayload.canRetry,
            timestamp: errorPayload.timestamp,
            retryAfter: errorPayload.retryAfter,
          } as any;
        }
      })
      .addCase(refreshPrices.pending, (state) => {
        state.refreshing = true;
        state.error = null;
      })
      .addCase(refreshPrices.fulfilled, (state, action) => {
        state.refreshing = false;
        const priceData = action.payload;
        
        // Update existing coins with new price data
        Object.keys(priceData).forEach(coinId => {
          if (state.coins[coinId]) {
            const coinPriceData = priceData[coinId];
            state.coins[coinId].current_price = coinPriceData.usd;
            state.coins[coinId].price_change_percentage_24h = coinPriceData.usd_24h_change || 0;
            if (coinPriceData.usd_market_cap) {
              state.coins[coinId].market_cap = coinPriceData.usd_market_cap;
            }
          }
        });
        
        state.lastUpdated = Date.now();
      })
      .addCase(refreshPrices.rejected, (state, action) => {
        state.refreshing = false;
        const errorPayload = action.payload as any;
        
        // For refresh failures, I don't want to clear existing data
        // Store error info but keep UI functional
        if (errorPayload && !errorPayload.isSilent) {
          state.error = {
            message: errorPayload.message,
            code: errorPayload.code,
            canRetry: errorPayload.canRetry,
            timestamp: errorPayload.timestamp,
            isRefreshError: true,
          } as any;
        }
        
        console.warn('Failed to refresh prices:', errorPayload);
      })
      // fetchCoinDetails cases
      .addCase(fetchCoinDetails.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchCoinDetails.fulfilled, (state, action) => {
        const coinData = action.payload;
        if (state.coins[coinData.id]) {
          state.coins[coinData.id] = {
            ...state.coins[coinData.id],
          };
        }
      })
      .addCase(fetchCoinDetails.rejected, (state, action) => {
        const errorPayload = action.payload as any;
        state.error = errorPayload?.message || 'Failed to fetch coin details';
      })
      .addCase(searchCoins.pending, (state) => {
        state.searching = true;
        state.error = null;
      })
      .addCase(searchCoins.fulfilled, (state, action) => {
        state.searching = false;
        state.searchResults = action.payload.map((coin: any) => ({
          id: coin.id,
          name: coin.name,
          symbol: coin.symbol,
          thumb: coin.thumb,
          market_cap_rank: coin.market_cap_rank || 0,
        }));
      })
      .addCase(searchCoins.rejected, (state, action) => {
        state.searching = false;
        const errorPayload = action.payload as any;
        state.error = {
          message: errorPayload?.message || 'Failed to search coins',
          code: errorPayload?.code,
          canRetry: errorPayload?.canRetry,
          timestamp: errorPayload?.timestamp,
          isSearchError: true,
        } as any;
      });
  },
});

export const { clearError, updateCoinPrice, clearSearchResults, updateRateLimitStatus, retryLastFailedAction } = cryptoSlice.actions;

export const selectAllCoins = createSelector(
  [(state: { crypto: CryptoState }) => state.crypto.coins, (state: { crypto: CryptoState }) => state.crypto.coinIds],
  (coins, coinIds) => coinIds.map(id => coins[id])
);

export const selectCoinById = (state: { crypto: CryptoState }, coinId: string) => 
  state.crypto.coins[coinId];

export const selectCryptoLoading = (state: { crypto: CryptoState }) => 
  state.crypto.loading;

export const selectCryptoRefreshing = (state: { crypto: CryptoState }) => 
  state.crypto.refreshing;

export const selectCryptoSearching = (state: { crypto: CryptoState }) => 
  state.crypto.searching;

export const selectCryptoError = (state: { crypto: CryptoState }) => 
  state.crypto.error;

export const selectLastUpdated = (state: { crypto: CryptoState }) => 
  state.crypto.lastUpdated;

export const selectSearchResults = (state: { crypto: CryptoState }) => 
  state.crypto.searchResults;

export const selectRateLimitStatus = (state: { crypto: CryptoState }) => 
  state.crypto.rateLimitStatus;

export const selectCoinIds = (state: { crypto: CryptoState }) => 
  state.crypto.coinIds;

export const selectFilteredCoins = createSelector(
  [
    selectAllCoins,
    (state: { crypto: CryptoState; ui: any }) => state.ui.searchQuery,
    (state: { crypto: CryptoState; ui: any }) => state.ui.filters,
    (state: { crypto: CryptoState; ui: any }) => state.ui.sortConfig,
  ],
  (allCoins, searchQuery, filters, sortConfig) => {
    let filteredCoins = [...allCoins];
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filteredCoins = filteredCoins.filter(coin => 
        coin.name.toLowerCase().includes(query) || 
        coin.symbol.toLowerCase().includes(query)
      );
    }
    
    if (filters.marketCapFilter === 'top10') {
      filteredCoins = filteredCoins.filter(coin => coin.market_cap_rank <= 10);
    } else if (filters.marketCapFilter === 'top50') {
      filteredCoins = filteredCoins.filter(coin => coin.market_cap_rank <= 50);
    }
    
    if (filters.priceChangeFilter === 'positive') {
      filteredCoins = filteredCoins.filter(coin => coin.price_change_percentage_24h >= 0);
    } else if (filters.priceChangeFilter === 'negative') {
      filteredCoins = filteredCoins.filter(coin => coin.price_change_percentage_24h < 0);
    }
    
    filteredCoins.sort((a, b) => {
      const aValue = a[sortConfig.key as keyof typeof a];
      const bValue = b[sortConfig.key as keyof typeof b];
      
      let comparison = 0;
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      }
      
      // Special handling for market cap and price - "ascending" should show highest values first
      if (sortConfig.key === 'market_cap' || sortConfig.key === 'current_price') {
        return sortConfig.direction === 'asc' ? -comparison : comparison;
      }
      
      // For market cap rank, ascending should show rank 1 first (lowest number = highest rank)
      if (sortConfig.key === 'market_cap_rank') {
        return sortConfig.direction === 'desc' ? -comparison : comparison;
      }
      
      return sortConfig.direction === 'desc' ? -comparison : comparison;
    });
    
    return filteredCoins;
  }
);

export default cryptoSlice.reducer;