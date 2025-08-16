import type { ChartDataPoint } from '../store/slices/cryptoSlice';

export interface TimeframeConfig {
  label: string;
  value: string;
  days: number;
}

export const TIMEFRAMES: TimeframeConfig[] = [
  { label: '24H', value: '24h', days: 1 },
  { label: '7D', value: '7d', days: 7 },
  { label: '30D', value: '30d', days: 30 },
  { label: '90D', value: '90d', days: 90 },
  { label: '1Y', value: '1y', days: 365 },
];

export const formatChartData = (data: ChartDataPoint[]) => {
  return data.map(point => ({
    ...point,
    date: new Date(point.timestamp).toLocaleDateString(),
    time: new Date(point.timestamp).toLocaleTimeString(),
    formattedPrice: formatPrice(point.price),
  }));
};

export const formatPrice = (price: number): string => {
  if (price >= 1000) {
    return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  } else if (price >= 1) {
    return `$${price.toFixed(4)}`;
  } else {
    return `$${price.toFixed(8)}`;
  }
};

export const formatMarketCap = (marketCap: number): string => {
  if (marketCap >= 1e12) {
    return `$${(marketCap / 1e12).toFixed(2)}T`;
  } else if (marketCap >= 1e9) {
    return `$${(marketCap / 1e9).toFixed(2)}B`;
  } else if (marketCap >= 1e6) {
    return `$${(marketCap / 1e6).toFixed(2)}M`;
  } else {
    return `$${marketCap.toLocaleString()}`;
  }
};

export const formatVolume = (volume: number): string => {
  if (volume >= 1e9) {
    return `$${(volume / 1e9).toFixed(2)}B`;
  } else if (volume >= 1e6) {
    return `$${(volume / 1e6).toFixed(2)}M`;
  } else if (volume >= 1e3) {
    return `$${(volume / 1e3).toFixed(2)}K`;
  } else {
    return `$${volume.toLocaleString()}`;
  }
};

export const calculatePriceChange = (data: ChartDataPoint[]): { change: number; changePercent: number } => {
  if (data.length < 2) {
    return { change: 0, changePercent: 0 };
  }

  const firstPrice = data[0].price;
  const lastPrice = data[data.length - 1].price;
  const change = lastPrice - firstPrice;
  const changePercent = (change / firstPrice) * 100;

  return { change, changePercent };
};

export const getChartColor = (data: ChartDataPoint[]): string => {
  const { changePercent } = calculatePriceChange(data);
  return changePercent >= 0 ? '#10b981' : '#ef4444'; // green-500 : red-500
};

export const getTimeframeLabel = (timeframe: string): string => {
  const config = TIMEFRAMES.find(tf => tf.value === timeframe);
  return config?.label || timeframe.toUpperCase();
};

export const isDataStale = (lastUpdated: number, maxAgeMinutes: number = 5): boolean => {
  const now = Date.now();
  const maxAge = maxAgeMinutes * 60 * 1000; // Convert to milliseconds
  return (now - lastUpdated) > maxAge;
};

export const getOptimalDataPoints = (data: ChartDataPoint[], maxPoints: number = 100): ChartDataPoint[] => {
  if (data.length <= maxPoints) {
    return data;
  }

  const step = Math.ceil(data.length / maxPoints);
  const optimized: ChartDataPoint[] = [];

  for (let i = 0; i < data.length; i += step) {
    optimized.push(data[i]);
  }

  // Last data point everytimes
  if (optimized[optimized.length - 1] !== data[data.length - 1]) {
    optimized.push(data[data.length - 1]);
  }

  return optimized;
};