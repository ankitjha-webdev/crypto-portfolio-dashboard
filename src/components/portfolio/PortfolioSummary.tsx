import React, { memo } from 'react';
import { useAppSelector } from '../../hooks/useAppSelector';
import { selectPortfolioSummary } from '../../store/slices/portfolioSlice';
import { formatCurrency, formatPercentage } from '../../utils/formatters';

const PortfolioSummary: React.FC = memo(() => {
  const portfolioSummary = useAppSelector(selectPortfolioSummary);

  if (!portfolioSummary.hasHoldings) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Portfolio Summary
        </h2>
        <div className="text-center py-8">
          <div className="text-gray-500 dark:text-gray-400 text-lg">
            No holdings in your portfolio yet
          </div>
          <p className="text-gray-400 dark:text-gray-500 mt-2">
            Add some cryptocurrencies to start tracking your portfolio
          </p>
        </div>
      </div>
    );
  }

  const isPositiveChange = portfolioSummary.totalChangePercentage24h >= 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Portfolio Summary
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Portfolio Value */}
        <div className="text-center md:text-left">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Total Value
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
            {formatCurrency(portfolioSummary.totalValue)}
          </div>
        </div>

        {/* 24h Change (Absolute) */}
        <div className="text-center md:text-left">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            24h Change
          </div>
          <div className={`text-2xl font-bold mt-1 ${
            isPositiveChange 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-red-600 dark:text-red-400'
          }`}>
            {isPositiveChange ? '+' : ''}{formatCurrency(portfolioSummary.totalChange24h)}
          </div>
        </div>

        {/* 24h Change (Percentage) */}
        <div className="text-center md:text-left">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            24h Change %
          </div>
          <div className={`text-2xl font-bold mt-1 flex items-center justify-center md:justify-start ${
            isPositiveChange 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-red-600 dark:text-red-400'
          }`}>
            <span className="mr-1">
              {isPositiveChange ? '↗' : '↘'}
            </span>
            {isPositiveChange ? '+' : ''}{formatPercentage(portfolioSummary.totalChangePercentage24h)}
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500 dark:text-gray-400">
            Holdings: {portfolioSummary.holdingsCount} {portfolioSummary.holdingsCount === 1 ? 'coin' : 'coins'}
          </span>
          <span className="text-gray-500 dark:text-gray-400">
            Updates automatically with market prices
          </span>
        </div>
      </div>
    </div>
  );
});

PortfolioSummary.displayName = 'PortfolioSummary';

export default PortfolioSummary;