import React, { useState, useEffect, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { 
  fetchHistoricalData, 
  selectChartData, 
  selectChartLoading,
  selectCoinById 
} from '../../store/slices/cryptoSlice';
import { 
  TIMEFRAMES, 
  formatChartData, 
  formatPrice, 
  calculatePriceChange, 
  getChartColor,
  isDataStale,
  getOptimalDataPoints 
} from '../../utils/chartUtils';

interface PriceChartProps {
  coinId: string;
  height?: number;
  showTimeframeSelector?: boolean;
  className?: string;
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
          Price: {data.formattedPrice}
        </p>
        {data.volume && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Volume: ${(data.volume / 1e6).toFixed(2)}M
          </p>
        )}
      </div>
    );
  }
  return null;
};

const PriceChart: React.FC<PriceChartProps> = ({ 
  coinId, 
  height = 400, 
  showTimeframeSelector = true,
  className = '' 
}) => {
  const dispatch = useAppDispatch();
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
  
  const chartData = useAppSelector(state => selectChartData(state, coinId, selectedTimeframe));
  const isLoading = useAppSelector(state => selectChartLoading(state, coinId, selectedTimeframe));
  const coin = useAppSelector(state => selectCoinById(state, coinId));
  const theme = useAppSelector(state => state.ui?.theme || 'light');

  useEffect(() => {
    const shouldFetch = !chartData || isDataStale(chartData.lastUpdated);
    
    if (shouldFetch && !isLoading) {
      dispatch(fetchHistoricalData({ coinId, timeframe: selectedTimeframe }));
    }
  }, [dispatch, coinId, selectedTimeframe, chartData, isLoading]);

  const processedData = useMemo(() => {
    if (!chartData?.data) return [];
    
    const formatted = formatChartData(chartData.data);
    return getOptimalDataPoints(formatted, 100);
  }, [chartData]);

  const priceChange = useMemo(() => {
    if (!chartData?.data) return { change: 0, changePercent: 0 };
    return calculatePriceChange(chartData.data);
  }, [chartData]);

  const chartColor = useMemo(() => {
    return getChartColor(chartData?.data || []);
  }, [chartData]);

  const handleTimeframeChange = (timeframe: string) => {
    setSelectedTimeframe(timeframe);
  };

  if (isLoading && !chartData) {
    return (
      <div className={`${className} flex items-center justify-center`} style={{ height }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-400">Loading chart...</span>
      </div>
    );
  }

  if (!chartData?.data || chartData.data.length === 0) {
    return (
      <div className={`${className} flex items-center justify-center`} style={{ height }}>
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">No chart data available</p>
          <button
            onClick={() => dispatch(fetchHistoricalData({ coinId, timeframe: selectedTimeframe }))}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header with coin info and price change */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {coin && (
            <>
              <img src={coin.image} alt={coin.name} className="w-8 h-8" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {coin.name} ({coin.symbol})
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Current: {formatPrice(coin.current_price)}
                </p>
              </div>
            </>
          )}
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
          <LineChart
            data={processedData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
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
            
            {/* Reference line for starting price */}
            {processedData.length > 0 && (
              <ReferenceLine 
                y={processedData[0].price} 
                stroke={theme === 'dark' ? '#6b7280' : '#9ca3af'}
                strokeDasharray="2 2"
                strokeOpacity={0.5}
              />
            )}
            
            <Line
              type="monotone"
              dataKey="price"
              stroke={chartColor}
              strokeWidth={2}
              dot={false}
              activeDot={{ 
                r: 4, 
                fill: chartColor,
                stroke: theme === 'dark' ? '#1f2937' : '#ffffff',
                strokeWidth: 2
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Chart info */}
      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
        Last updated: {chartData.lastUpdated ? new Date(chartData.lastUpdated).toLocaleString() : 'Never'}
      </div>
    </div>
  );
};

export default PriceChart;