import { createSlice, createSelector } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../index';

export interface Holding {
  coinId: string;
  amount: number;
  averageBuyPrice?: number; // Optional for future features
  dateAdded: number; // Timestamp
}

export interface PortfolioState {
  holdings: Record<string, Holding>; // Keyed by coin ID
  totalValue: number;
  totalChange24h: number;
  totalChangePercentage24h: number;
  lastCalculated: number;
}

const loadPersistedPortfolio = (): Record<string, Holding> => {
  try {
    const persistedPortfolio = localStorage.getItem('crypto-portfolio-holdings');
    return persistedPortfolio ? JSON.parse(persistedPortfolio) : {};
  } catch (error) {
    console.warn('Failed to load persisted portfolio:', error);
    return {};
  }
};

const savePortfolioToLocalStorage = (holdings: Record<string, Holding>) => {
  try {
    localStorage.setItem('crypto-portfolio-holdings', JSON.stringify(holdings));
  } catch (error) {
    console.warn('Failed to save portfolio to localStorage:', error);
  }
};

const initialState: PortfolioState = {
  holdings: loadPersistedPortfolio(),
  totalValue: 0,
  totalChange24h: 0,
  totalChangePercentage24h: 0,
  lastCalculated: 0,
};

const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState,
  reducers: {
    addHolding: (state, action: PayloadAction<{ coinId: string; amount: number; averageBuyPrice?: number }>) => {
      const { coinId, amount, averageBuyPrice } = action.payload;
      
      if (!coinId || typeof coinId !== 'string') {
        console.error('Invalid coinId provided to addHolding');
        return;
      }
      
      if (!amount || amount <= 0 || !isFinite(amount)) {
        console.error('Invalid amount provided to addHolding');
        return;
      }
      
      try {
        if (state.holdings[coinId]) {
          const existingHolding = state.holdings[coinId];
          existingHolding.amount += amount;
          
          if (averageBuyPrice && existingHolding.averageBuyPrice) {
            const totalValue = (existingHolding.amount - amount) * existingHolding.averageBuyPrice + amount * averageBuyPrice;
            existingHolding.averageBuyPrice = totalValue / existingHolding.amount;
          } else if (averageBuyPrice) {
            existingHolding.averageBuyPrice = averageBuyPrice;
          }
        } else {
          state.holdings[coinId] = {
            coinId,
            amount,
            averageBuyPrice,
            dateAdded: Date.now(),
          };
        }
        
        savePortfolioToLocalStorage(state.holdings);
      } catch (error) {
        console.error('Error adding holding:', error);
      }
    },
    updateHolding: (state, action: PayloadAction<{ coinId: string; amount: number; averageBuyPrice?: number }>) => {
      const { coinId, amount, averageBuyPrice } = action.payload;
      
      if (!coinId || typeof coinId !== 'string') {
        console.error('Invalid coinId provided to updateHolding');
        return;
      }
      
      if (!amount || amount < 0 || !isFinite(amount)) {
        console.error('Invalid amount provided to updateHolding');
        return;
      }
      
      try {
        if (state.holdings[coinId]) {
          if (amount === 0) {
            delete state.holdings[coinId];
          } else {
            state.holdings[coinId].amount = amount;
            if (averageBuyPrice !== undefined && averageBuyPrice >= 0) {
              state.holdings[coinId].averageBuyPrice = averageBuyPrice;
            }
          }
          savePortfolioToLocalStorage(state.holdings);
        } else {
          console.warn(`Attempted to update non-existent holding: ${coinId}`);
        }
      } catch (error) {
        console.error('Error updating holding:', error);
      }
    },
    removeHolding: (state, action: PayloadAction<string>) => {
      const coinId = action.payload;
      
      if (!coinId || typeof coinId !== 'string') {
        console.error('Invalid coinId provided to removeHolding');
        return;
      }
      
      try {
        if (state.holdings[coinId]) {
          delete state.holdings[coinId];
          savePortfolioToLocalStorage(state.holdings);
        } else {
          console.warn(`Attempted to remove non-existent holding: ${coinId}`);
        }
      } catch (error) {
        console.error('Error removing holding:', error);
      }
    },
    clearPortfolio: (state) => {
      try {
        state.holdings = {};
        state.totalValue = 0;
        state.totalChange24h = 0;
        state.totalChangePercentage24h = 0;
        state.lastCalculated = 0;
        localStorage.removeItem('crypto-portfolio-holdings');
      } catch (error) {
        console.error('Error clearing portfolio:', error);
      }
    },
    updatePortfolioCalculations: (state, action: PayloadAction<{
      totalValue: number;
      totalChange24h: number;
      totalChangePercentage24h: number;
    }>) => {
      const { totalValue, totalChange24h, totalChangePercentage24h } = action.payload;
      state.totalValue = totalValue;
      state.totalChange24h = totalChange24h;
      state.totalChangePercentage24h = totalChangePercentage24h;
      state.lastCalculated = Date.now();
    },
  },
});

export const {
  addHolding,
  updateHolding,
  removeHolding,
  clearPortfolio,
  updatePortfolioCalculations,
} = portfolioSlice.actions;

export const selectPortfolioHoldings = (state: RootState) => state.portfolio.holdings;
export const selectPortfolioTotalValue = (state: RootState) => state.portfolio.totalValue;
export const selectPortfolioChange24h = (state: RootState) => state.portfolio.totalChange24h;
export const selectPortfolioChangePercentage24h = (state: RootState) => state.portfolio.totalChangePercentage24h;

export const selectPortfolioWithCurrentPrices = createSelector(
  [selectPortfolioHoldings, (state: RootState) => state.crypto.coins],
  (holdings, coins) => {
    let totalValue = 0;
    let totalValue24hAgo = 0;
    const holdingsWithValues: Array<Holding & {
      currentPrice: number;
      currentValue: number;
      change24h: number;
      changePercentage24h: number;
      coinName: string;
      coinSymbol: string;
      coinImage: string;
    }> = [];

    Object.values(holdings).forEach(holding => {
      const coin = coins[holding.coinId];
      if (coin) {
        const currentPrice = coin.current_price;
        const currentValue = holding.amount * currentPrice;
        const priceChange24h = coin.price_change_percentage_24h || 0;
        const price24hAgo = currentPrice / (1 + priceChange24h / 100);
        const value24hAgo = holding.amount * price24hAgo;
        const change24h = currentValue - value24hAgo;
        const changePercentage24h = value24hAgo > 0 ? (change24h / value24hAgo) * 100 : 0;

        totalValue += currentValue;
        totalValue24hAgo += value24hAgo;

        holdingsWithValues.push({
          ...holding,
          currentPrice,
          currentValue,
          change24h,
          changePercentage24h,
          coinName: coin.name,
          coinSymbol: coin.symbol,
          coinImage: coin.image,
        });
      }
    });

    const totalChange24h = totalValue - totalValue24hAgo;
    const totalChangePercentage24h = totalValue24hAgo > 0 ? (totalChange24h / totalValue24hAgo) * 100 : 0;

    return {
      holdings: holdingsWithValues,
      totalValue,
      totalChange24h,
      totalChangePercentage24h,
      hasHoldings: Object.keys(holdings).length > 0,
    };
  }
);

export const selectHoldingByCoinId = createSelector(
  [selectPortfolioHoldings, (_state: RootState, coinId: string) => coinId],
  (holdings, coinId) => holdings[coinId] || null
);

export const selectPortfolioSummary = createSelector(
  [selectPortfolioWithCurrentPrices],
  (portfolio) => ({
    totalValue: portfolio.totalValue,
    totalChange24h: portfolio.totalChange24h,
    totalChangePercentage24h: portfolio.totalChangePercentage24h,
    holdingsCount: portfolio.holdings.length,
    hasHoldings: portfolio.hasHoldings,
  })
);

export const selectPortfolioPerformanceMetrics = createSelector(
  [selectPortfolioWithCurrentPrices],
  (portfolio) => {
    if (!portfolio.hasHoldings) {
      return {
        totalValue: 0,
        totalChange24h: 0,
        totalChangePercentage24h: 0,
        bestPerformer: null,
        worstPerformer: null,
        totalHoldings: 0,
      };
    }

    let bestPerformer = portfolio.holdings[0];
    let worstPerformer = portfolio.holdings[0];

    portfolio.holdings.forEach(holding => {
      if (holding.changePercentage24h > bestPerformer.changePercentage24h) {
        bestPerformer = holding;
      }
      if (holding.changePercentage24h < worstPerformer.changePercentage24h) {
        worstPerformer = holding;
      }
    });

    return {
      totalValue: portfolio.totalValue,
      totalChange24h: portfolio.totalChange24h,
      totalChangePercentage24h: portfolio.totalChangePercentage24h,
      bestPerformer: bestPerformer ? {
        coinName: bestPerformer.coinName,
        coinSymbol: bestPerformer.coinSymbol,
        changePercentage24h: bestPerformer.changePercentage24h,
        change24h: bestPerformer.change24h,
      } : null,
      worstPerformer: worstPerformer ? {
        coinName: worstPerformer.coinName,
        coinSymbol: worstPerformer.coinSymbol,
        changePercentage24h: worstPerformer.changePercentage24h,
        change24h: worstPerformer.change24h,
      } : null,
      totalHoldings: portfolio.holdings.length,
    };
  }
);

export default portfolioSlice.reducer;