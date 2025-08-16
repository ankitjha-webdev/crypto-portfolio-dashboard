import React, { useState, useEffect, useMemo } from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
} from 'recharts';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { 
  fetchHistoricalData
} from '../../store/slices/cryptoSlice';
import { selectPortfolioWithCurrentPrices } from '../../store/slices/portfolioSlice';
import { 
  TIMEFRAMES, 
  formatPrice,
  isDataStale 
} from '../../utils/chartUtils';

interface PortfolioChartProps {
  height?: number;
  showTimeframeSelector?: boolean;
  className?: string;
}

interface PortfolioDataPoint {
  timestamp: number;
  date: string;
  time: string;
  totalValue: number;
  formattedValue: string;
  change: number;
  changePercent: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400">{data.date}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">{data.time}</p>
        <p className="font-semibold text-gray-900 dark:text-white">
          Portfolio Value: {data.formattedValue}
        </p>
        <p className={`text-sm ${data.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          Change: {data.changePercent >= 0 ? '+' : ''}{data.changePercent.toFixed(2)}%
        </p>
      </div>
    );
  }
  return null;
};

const PortfolioChart: React.FC<PortfolioChartProps> = ({ 
  height = 400, 
  showTimeframeSelector = true,
  className = '' 
}) => {
  const dispatch = useAppDispatch();
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
  const [isLoading, setIsLoading] = useState(false);
  
  const portfolio = useAppSelector(selectPortfolioWithCurrentPrices);
  const theme = useAppSelector(state => state.ui?.theme || 'light');

  const allChartData = useAppSelector(state => state.crypto.chartData);
  const allChartLoading = useAppSelector(state => state.crypto.chartLoading);
  
  const holdingChartData = useMemo(() => {
    const data: Record<string, any> = {};
    portfolio.holdings.forEach(holding => {
      const key = `${holding.coinId}-${selectedTimeframe}`;
      const chartData = allChartData[key];
      const loading = allChartLoading[key] || false;
      data[holding.coinId] = { chartData, loading, holding };
    });
    return data;
  }, [portfolio.holdings, selectedTimeframe, allChartData, allChartLoading]);

  useEffect(() => {
    if (!portfolio.hasHoldings) return;

    setIsLoading(true);
    const loadPromises = portfolio.holdings.map(holding => {
      const chartData = holdingChartData[holding.coinId]?.chartData;
      const shouldFetch = !chartData || isDataStale(chartData.lastUpdated);
      
      if (shouldFetch) {
        return dispatch(fetchHistoricalData({ coinId: holding.coinId, timeframe: selectedTimeframe }));
      }
      return Promise.resolve();
    });

    Promise.allSettled(loadPromises).finally(() => {
      setIsLoading(false);
    });
  }, [dispatch, portfolio.holdings, selectedTimeframe, holdingChartData]);

  const portfolioData = useMemo((): PortfolioDataPoint[] => {
    if (!portfolio.hasHoldings) return [];

    const allChartData: Record<string, any[]> = {};
    let hasAllData = true;

    portfolio.holdings.forEach(holding => {
      const data = holdingChartData[holding.coinId]?.chartData?.data;
      if (data && data.length > 0) {
        allChartData[holding.coinId] = data;
      } else {
        hasAllData = false;
      }
    });

    if (!hasAllData || Object.keys(allChartData).length === 0) {
      return [];
    }

    const timestamps = new Set<number>();
    const firstCoinData = Object.values(allChartData)[0];
    
    firstCoinData.forEach(point => {
      const timestamp = point.timestamp;
      const hasAllCoins = portfolio.holdings.every(holding => {
        const coinData = allChartData[holding.coinId];
        return coinData && coinData.some(p => Math.abs(p.timestamp - timestamp) < 3600000); // 1 hour tolerance
      });
      
      if (hasAllCoins) {
        timestamps.add(timestamp);
      }
    });

    const portfolioPoints: PortfolioDataPoint[] = [];
    const sortedTimestamps = Array.from(timestamps).sort((a, b) => a - b);

    sortedTimestamps.forEach(timestamp => {
      let totalValue = 0;
      let hasValidData = true;

      portfolio.holdings.forEach(holding => {
        const coinData = allChartData[holding.coinId];
        const dataPoint = coinData.find(p => Math.abs(p.timestamp - timestamp) < 3600000);
        
        if (dataPoint) {
          totalValue += holding.amount * dataPoint.price;
        } else {
          hasValidData = false;
        }
      });

      if (hasValidData && totalValue > 0) {
        portfolioPoints.push({
          timestamp,
          date: new Date(timestamp).toLocaleDateString(),
          time: new Date(timestamp).toLocaleTimeString(),
          totalValue,
          formattedValue: formatPrice(totalValue),
          change: 0, // Will be calculated below
          changePercent: 0, // Will be calculated below
        });
      }
    });

    if (portfolioPoints.length > 0) {
      const firstValue = portfolioPoints[0].totalValue;
      portfolioPoints.forEach(point => {
        point.change = point.totalValue - firstValue;
        point.changePercent = firstValue > 0 ? (point.change / firstValue) * 100 : 0;
      });
    }

    return portfolioPoints;
  }, [portfolio, holdingChartData]);

  const priceChange = useMemo(() => {
    if (portfolioData.length < 2) return { change: 0, changePercent: 0 };
    const first = portfolioData[0];
    const last = portfolioData[portfolioData.length - 1];
    return {
      change: last.totalValue - first.totalValue,
      changePercent: first.totalValue > 0 ? ((last.totalValue - first.totalValue) / first.totalValue) * 100 : 0
    };
  }, [portfolioData]);

  const chartColor = useMemo(() => {
    return priceChange.changePercent >= 0 ? '#10b981' : '#ef4444'; // green-500 : red-500
  }, [priceChange]);

  const handleTimeframeChange = (timeframe: string) => {
    setSelectedTimeframe(timeframe);
  };

  if (!portfolio.hasHoldings) {
    return (
      <div className={`${className} flex items-center justify-center`} style={{ height }}>
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Add holdings to see portfolio performance</p>
        </div>
      </div>
    );
  }

  if (isLoading || portfolioData.length === 0) {
    return (
      <div className={`${className} flex items-center justify-center`} style={{ height }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <span className="mt-2 text-gray-600 dark:text-gray-400">
            {isLoading ? 'Loading portfolio data...' : 'No portfolio data available'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header with portfolio performance */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Portfolio Performance
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Current Value: {formatPrice(portfolio.totalValue)}
          </p>
        </div>
        
        <div className="text-right">
          <p className={`font-semibold ${priceChange.changePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {priceChange.changePercent >= 0 ? '+' : ''}{priceChange.changePercent.toFixed(2)}%
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {selectedTimeframe.toUpperCase()} Change
          </p>
        </div>
      </div>

      {/* Timeframe Selector */}
      {showTimeframeSelector && (
        <div className="flex space-x-1 mb-4 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {TIMEFRAMES.map((timeframe) => (
            <button
              key={timeframe.value}
              onClick={() => handleTimeframeChange(timeframe.value)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                selectedTimeframe === timeframe.value
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {timeframe.label}
            </button>
          ))}
        </div>
      )}

      {/* Chart */}
      <div className="relative">
        {isLoading && (
          <div className="absolute top-2 right-2 z-10">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          </div>
        )}
        
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart
            data={portfolioData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <defs>
              <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColor} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={chartColor} stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={theme === 'dark' ? '#374151' : '#e5e7eb'}
            />
            <XAxis 
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
            />
            <YAxis 
              domain={['dataMin - dataMin * 0.01', 'dataMax + dataMax * 0.01']}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
              tickFormatter={(value) => formatPrice(value)}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Reference line for starting value */}
            {portfolioData.length > 0 && (
              <ReferenceLine 
                y={portfolioData[0].totalValue} 
                stroke={theme === 'dark' ? '#6b7280' : '#9ca3af'}
                strokeDasharray="2 2"
                strokeOpacity={0.5}
              />
            )}
            
            <Area
              type="monotone"
              dataKey="totalValue"
              stroke={chartColor}
              strokeWidth={2}
              fill="url(#portfolioGradient)"
              dot={false}
              activeDot={{ 
                r: 4, 
                fill: chartColor,
                stroke: theme === 'dark' ? '#1f2937' : '#ffffff',
                strokeWidth: 2
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Portfolio breakdown */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400">Holdings</p>
          <p className="font-semibold text-gray-900 dark:text-white">{portfolio.holdings.length}</p>
        </div>
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400">24h Change</p>
          <p className={`font-semibold ${portfolio.totalChangePercentage24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {portfolio.totalChangePercentage24h >= 0 ? '+' : ''}{portfolio.totalChangePercentage24h.toFixed(2)}%
          </p>
        </div>
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400">Best Performer</p>
          <p className="font-semibold text-green-500">
            {portfolio.holdings.length > 0 
              ? portfolio.holdings.reduce((best, holding) => 
                  holding.changePercentage24h > best.changePercentage24h ? holding : best
                ).coinSymbol.toUpperCase()
              : 'N/A'
            }
          </p>
        </div>
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400">Worst Performer</p>
          <p className="font-semibold text-red-500">
            {portfolio.holdings.length > 0 
              ? portfolio.holdings.reduce((worst, holding) => 
                  holding.changePercentage24h < worst.changePercentage24h ? holding : worst
                ).coinSymbol.toUpperCase()
              : 'N/A'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default PortfolioChart;