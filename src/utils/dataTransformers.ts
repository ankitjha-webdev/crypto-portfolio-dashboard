import type { CoinData } from '../store/slices/cryptoSlice';

export const normalizeCoins = (coins: CoinData[]) => {
  const normalized: Record<string, CoinData> = {};
  const ids: string[] = [];
  
  coins.forEach(coin => {
    normalized[coin.id] = coin;
    ids.push(coin.id);
  });
  
  return { normalized, ids };
};

export const formatCurrency = (value: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: value < 1 ? 6 : 2,
    maximumFractionDigits: value < 1 ? 6 : 2,
  }).format(value);
};

export const formatPercentage = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100);
};

export const formatMarketCap = (value: number): string => {
  if (value >= 1e12) {
    return `$${(value / 1e12).toFixed(2)}T`;
  } else if (value >= 1e9) {
    return `$${(value / 1e9).toFixed(2)}B`;
  } else if (value >= 1e6) {
    return `$${(value / 1e6).toFixed(2)}M`;
  } else if (value >= 1e3) {
    return `$${(value / 1e3).toFixed(2)}K`;
  }
  return `$${value.toFixed(2)}`;
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: number;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => func(...args), delay);
  };
};

export const getTimeUntilReset = (resetTime: number): number => {
  return Math.max(0, resetTime - Date.now());
};

export const isDataStale = (lastUpdated: number, maxAge: number = 30000): boolean => {
  return Date.now() - lastUpdated > maxAge;
};

export const sortCoins = (
  coins: CoinData[],
  sortBy: 'name' | 'price' | 'change' | 'market_cap' | 'rank',
  direction: 'asc' | 'desc' = 'desc'
): CoinData[] => {
  return [...coins].sort((a, b) => {
    let aValue: number | string;
    let bValue: number | string;

    switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'price':
        aValue = a.current_price;
        bValue = b.current_price;
        break;
      case 'change':
        aValue = a.price_change_percentage_24h;
        bValue = b.price_change_percentage_24h;
        break;
      case 'market_cap':
        aValue = a.market_cap;
        bValue = b.market_cap;
        break;
      case 'rank':
        aValue = a.market_cap_rank;
        bValue = b.market_cap_rank;
        break;
      default:
        return 0;
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return direction === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    const numA = Number(aValue);
    const numB = Number(bValue);
    
    return direction === 'asc' ? numA - numB : numB - numA;
  });
};

export const filterCoinsBySearch = (coins: CoinData[], query: string): CoinData[] => {
  if (!query.trim()) return coins;
  
  const lowercaseQuery = query.toLowerCase();
  return coins.filter(coin => 
    coin.name.toLowerCase().includes(lowercaseQuery) ||
    coin.symbol.toLowerCase().includes(lowercaseQuery)
  );
};

export const filterCoinsByPriceChange = (
  coins: CoinData[], 
  filter: 'all' | 'positive' | 'negative'
): CoinData[] => {
  switch (filter) {
    case 'positive':
      return coins.filter(coin => coin.price_change_percentage_24h > 0);
    case 'negative':
      return coins.filter(coin => coin.price_change_percentage_24h < 0);
    default:
      return coins;
  }
};

export const limitCoinsByMarketCap = (
  coins: CoinData[], 
  limit: 'all' | 'top10' | 'top50'
): CoinData[] => {
  switch (limit) {
    case 'top10':
      return coins.filter(coin => coin.market_cap_rank <= 10);
    case 'top50':
      return coins.filter(coin => coin.market_cap_rank <= 50);
    default:
      return coins;
  }
};