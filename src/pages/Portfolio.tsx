import React, { useEffect, useState, useCallback } from 'react';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import {
  selectPortfolioWithCurrentPrices,
  selectPortfolioSummary,
  addHolding,
  updateHolding,
  removeHolding,
  updatePortfolioCalculations
} from '../store/slices/portfolioSlice';
import { fetchCoins, selectAllCoins, selectCryptoLoading, selectCryptoError } from '../store/slices/cryptoSlice';
import { ErrorBoundary, ErrorDisplay, LoadingSpinner } from '../components/common';
import { useToast } from '../components/common/ToastContainer';

interface HoldingFormData {
  coinId: string;
  amount: string;
  averageBuyPrice: string;
}

const Portfolio: React.FC = () => {
  const dispatch = useAppDispatch();
  const portfolio = useAppSelector(selectPortfolioWithCurrentPrices);
  const portfolioSummary = useAppSelector(selectPortfolioSummary);
  const coins = useAppSelector(selectAllCoins);
  const cryptoLoading = useAppSelector(selectCryptoLoading);
  const cryptoError = useAppSelector(selectCryptoError);
  const { showError } = useToast();

  const [showAddForm, setShowAddForm] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [editingHolding, setEditingHolding] = useState<string | null>(null);
  const [formData, setFormData] = useState<HoldingFormData>({
    coinId: '',
    amount: '',
    averageBuyPrice: '',
  });

  useEffect(() => {
    // Fetch crypto data if not already loaded
    if (coins.length === 0) {
      dispatch(fetchCoins(50));
    }
  }, [dispatch, coins.length]);

  useEffect(() => {
    if (portfolio.totalValue !== undefined) {
      dispatch(updatePortfolioCalculations({
        totalValue: portfolio.totalValue,
        totalChange24h: portfolio.totalChange24h,
        totalChangePercentage24h: portfolio.totalChangePercentage24h,
      }));
    }
  }, [dispatch, portfolio.totalValue, portfolio.totalChange24h, portfolio.totalChangePercentage24h]);

  const handleFormSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();

    try {
      const amount = parseFloat(formData.amount);
      const averageBuyPrice = formData.averageBuyPrice ? parseFloat(formData.averageBuyPrice) : undefined;

      if (!formData.coinId) {
        showError('Validation Error', 'Please select a cryptocurrency.');
        return;
      }

      if (isNaN(amount) || amount <= 0) {
        showError('Validation Error', 'Please enter a valid amount greater than 0.');
        return;
      }

      if (averageBuyPrice !== undefined && (isNaN(averageBuyPrice) || averageBuyPrice < 0)) {
        showError('Validation Error', 'Average buy price must be a positive number.');
        return;
      }

      if (editingHolding) {
        dispatch(updateHolding({
          coinId: formData.coinId,
          amount,
          averageBuyPrice,
        }));
        setEditingHolding(null);
      } else {
        dispatch(addHolding({
          coinId: formData.coinId,
          amount,
          averageBuyPrice,
        }));
      }

      setIsClosing(true);
      setTimeout(() => {
        setFormData({ coinId: '', amount: '', averageBuyPrice: '' });
        setShowAddForm(false);
        setIsClosing(false);
      }, 150);
    } catch (error) {
      console.error('Error submitting form', error);
      showError('Form Error', 'An error occurred while saving your holding. Please try again.');
    }
  }, [formData, editingHolding, dispatch, showError]);

  const handleEditHolding = useCallback((holding: any) => {
    setFormData({
      coinId: holding.coinId,
      amount: holding.amount.toString(),
      averageBuyPrice: holding.averageBuyPrice?.toString() || '',
    });
    setEditingHolding(holding.coinId);
    setShowAddForm(true);
  }, []);

  const handleDeleteHolding = useCallback((coinId: string) => {
    if (confirm('Are you sure you want to remove this holding?')) {
      try {
        dispatch(removeHolding(coinId));
      } catch (error) {
        console.error('Error removing holding', error);
        showError('Delete Error', 'Failed to remove holding. Please try again.');
      }
    }
  }, [dispatch, showError]);

  const handleCancelForm = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setFormData({ coinId: '', amount: '', averageBuyPrice: '' });
      setShowAddForm(false);
      setEditingHolding(null);
      setIsClosing(false);
    }, 150); // Match the animation duration
  }, []);

  const formatCurrency = useCallback((value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }, []);

  const formatPercentage = useCallback((value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  }, []);

  if (cryptoLoading && coins.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingSpinner
          size="lg"
          text="Loading..."
          centered
          className="min-h-[400px]"
        />
      </div>
    );
  }

  if (cryptoError && coins.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="max-w-md w-full">
            <ErrorDisplay
              error={cryptoError}
              onRetry={() => dispatch(fetchCoins(50))}
              size="large"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            My Portfolio
          </h1>
          <p className="hidden sm:block mt-1 text-sm text-gray-500 dark:text-gray-400">
          Monitor your assets and track portfolio performance
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Holding</span>
        </button>
      </div>

      {/* Portfolio Summary */}
      <ErrorBoundary fallback={
        <div className="mb-8">
          <ErrorDisplay
            error="Failed to load portfolio summary"
            size="medium"
          />
        </div>
      }>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Total Value
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(portfolioSummary.totalValue)}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              24h Change
            </h3>
            <p className={`text-2xl font-bold ${portfolioSummary.totalChange24h >= 0
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
              }`}>
              {formatCurrency(portfolioSummary.totalChange24h)}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              24h Change %
            </h3>
            <p className={`text-2xl font-bold ${portfolioSummary.totalChangePercentage24h >= 0
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
              }`}>
              {formatPercentage(portfolioSummary.totalChangePercentage24h)}
            </p>
          </div>
        </div>
      </ErrorBoundary>

      {/* Holdings List */}
      <ErrorBoundary fallback={
        <ErrorDisplay
          error="Failed to load holdings list"
          size="large"
        />
      }>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Holdings ({portfolioSummary.holdingsCount})
            </h2>
          </div>

          <div className="p-6">
            {!portfolioSummary.hasHoldings ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  No holdings yet
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Get started by adding your first cryptocurrency holding.
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Add Your First Holding
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {portfolio.holdings.map((holding) => (
                  <div key={holding.coinId} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <img src={holding.coinImage} alt={holding.coinName} className="w-10 h-10 rounded-full" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {holding.coinName} ({holding.coinSymbol.toUpperCase()})
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {holding.amount} {holding.coinSymbol.toUpperCase()} × {formatCurrency(holding.currentPrice)}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(holding.currentValue)}
                      </div>
                      <div className={`text-sm ${holding.change24h >= 0
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                        }`}>
                        {formatCurrency(holding.change24h)} ({formatPercentage(holding.changePercentage24h)})
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleEditHolding(holding)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteHolding(holding.coinId)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </ErrorBoundary>

      {/* Add/Edit Holding Form Modal */}
      {showAddForm && (
        <div
          className={`fixed inset-0 bg-black/20 modal-backdrop flex items-center justify-center p-4 z-50 ${isClosing ? 'animate-fade-out' : 'animate-fade-in'
            }`}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCancelForm();
            }
          }}
        >
          <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full modal-content ${isClosing ? 'animate-slide-down' : 'animate-slide-up'
            }`}>
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingHolding ? 'Edit Holding' : 'Add New Holding'}
              </h3>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cryptocurrency
                </label>
                <select
                  value={formData.coinId}
                  onChange={(e) => setFormData({ ...formData, coinId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                  disabled={!!editingHolding}
                >
                  <option value="">Select a cryptocurrency</option>
                  {coins.map((coin) => (
                    <option key={coin.id} value={coin.id}>
                      {coin.name} ({coin.symbol.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Average Buy Price (Optional)
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.averageBuyPrice}
                  onChange={(e) => setFormData({ ...formData, averageBuyPrice: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="0.00"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                >
                  {editingHolding ? 'Update Holding' : 'Add Holding'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Portfolio;
