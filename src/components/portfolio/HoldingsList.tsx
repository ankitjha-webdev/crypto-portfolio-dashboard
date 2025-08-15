import React, { memo, useState, useCallback } from 'react';
import { useAppSelector } from '../../hooks/useAppSelector';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { selectPortfolioWithCurrentPrices, removeHolding, type Holding } from '../../store/slices/portfolioSlice';
import { formatCurrency, formatPercentage, formatCoinAmount } from '../../utils/formatters';

interface HoldingsListProps {
  onEditHolding?: (coinId: string, amount: number, averageBuyPrice?: number) => void;
}

const HoldingsList: React.FC<HoldingsListProps> = memo(({ onEditHolding }) => {
  const dispatch = useAppDispatch();
  const portfolio = useAppSelector(selectPortfolioWithCurrentPrices);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleDeleteHolding = useCallback((coinId: string) => {
    if (confirmDelete === coinId) {
      dispatch(removeHolding(coinId));
      setConfirmDelete(null);
    } else {
      setConfirmDelete(coinId);
      setTimeout(() => {
        setConfirmDelete(null);
      }, 3000);
    }
  }, [confirmDelete, dispatch]);

  const handleEditHolding = useCallback((coinId: string, amount: number, averageBuyPrice?: number) => {
    if (onEditHolding) {
      onEditHolding(coinId, amount, averageBuyPrice);
    }
  }, [onEditHolding]);

  if (!portfolio.hasHoldings) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Your Holdings
        </h3>
        <div className="text-center py-8">
          <div className="text-gray-500 dark:text-gray-400">
            No holdings to display
          </div>
          <p className="text-gray-400 dark:text-gray-500 mt-2 text-sm">
            Add your first cryptocurrency holding to get started
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          Your Holdings ({portfolio.holdings.length})
        </h3>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Coin
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Value
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                24h Change
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {portfolio.holdings.map((holding: Holding & {
              currentPrice: number;
              currentValue: number;
              change24h: number;
              changePercentage24h: number;
              coinName: string;
              coinSymbol: string;
              coinImage: string;
            }) => {
              const isPositiveChange = holding.changePercentage24h >= 0;
              const isConfirmingDelete = confirmDelete === holding.coinId;

              return (
                <tr key={holding.coinId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={holding.coinImage}
                        alt={holding.coinName}
                        className="w-8 h-8 rounded-full mr-3"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder-coin.svg';
                        }}
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {holding.coinName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 uppercase">
                          {holding.coinSymbol}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 dark:text-white">
                    {formatCoinAmount(holding.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 dark:text-white">
                    {formatCurrency(holding.currentPrice)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900 dark:text-white">
                    {formatCurrency(holding.currentValue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <div className={`${
                      isPositiveChange 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      <div>{isPositiveChange ? '+' : ''}{formatCurrency(holding.change24h)}</div>
                      <div className="text-xs">
                        {isPositiveChange ? '+' : ''}{formatPercentage(holding.changePercentage24h)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleEditHolding(holding.coinId, holding.amount, holding.averageBuyPrice)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                        title="Edit holding"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteHolding(holding.coinId)}
                        className={`transition-colors ${
                          isConfirmingDelete
                            ? 'text-red-800 dark:text-red-300 font-semibold'
                            : 'text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300'
                        }`}
                        title={isConfirmingDelete ? 'Click again to confirm deletion' : 'Delete holding'}
                      >
                        {isConfirmingDelete ? 'Confirm?' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden">
        {portfolio.holdings.map((holding: Holding & {
          currentPrice: number;
          currentValue: number;
          change24h: number;
          changePercentage24h: number;
          coinName: string;
          coinSymbol: string;
          coinImage: string;
        }) => {
          const isPositiveChange = holding.changePercentage24h >= 0;
          const isConfirmingDelete = confirmDelete === holding.coinId;

          return (
            <div key={holding.coinId} className="border-b border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <img
                    src={holding.coinImage}
                    alt={holding.coinName}
                    className="w-10 h-10 rounded-full mr-3"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder-coin.svg';
                    }}
                  />
                  <div>
                    <div className="text-base font-medium text-gray-900 dark:text-white">
                      {holding.coinName}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 uppercase">
                      {holding.coinSymbol}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(holding.currentValue)}
                  </div>
                  <div className={`text-sm ${
                    isPositiveChange 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {isPositiveChange ? '+' : ''}{formatPercentage(holding.changePercentage24h)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Amount:</span>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {formatCoinAmount(holding.amount)}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Price:</span>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(holding.currentPrice)}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className={`text-sm ${
                  isPositiveChange 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  24h: {isPositiveChange ? '+' : ''}{formatCurrency(holding.change24h)}
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleEditHolding(holding.coinId, holding.amount, holding.averageBuyPrice)}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors text-sm font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteHolding(holding.coinId)}
                    className={`text-sm font-medium transition-colors ${
                      isConfirmingDelete
                        ? 'text-red-800 dark:text-red-300'
                        : 'text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300'
                    }`}
                  >
                    {isConfirmingDelete ? 'Confirm Delete?' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

HoldingsList.displayName = 'HoldingsList';

export default HoldingsList;