export const COINGECKO_API_BASE_URL = 'https://api.coingecko.com/api/v3';

export const REFRESH_INTERVAL = 30000; // 30 seconds
export const DEFAULT_COINS_LIMIT = 50;

export const MARKET_CAP_FILTERS = {
  ALL: 'all',
  TOP_10: 'top10',
  TOP_50: 'top50',
} as const;

export const PRICE_CHANGE_FILTERS = {
  ALL: 'all',
  POSITIVE: 'positive',
  NEGATIVE: 'negative',
} as const;

export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
} as const;

export const STORAGE_KEYS = {
  THEME: 'crypto-dashboard-theme',
  PORTFOLIO: 'crypto-dashboard-portfolio',
  FILTERS: 'crypto-dashboard-filters',
} as const;
