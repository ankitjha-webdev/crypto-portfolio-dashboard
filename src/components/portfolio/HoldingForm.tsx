import React, { memo, useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useAppSelector } from '../../hooks/useAppSelector';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { addHolding, updateHolding, selectHoldingByCoinId } from '../../store/slices/portfolioSlice';
import { searchCoins, clearSearchResults, selectSearchResults, selectCryptoSearching, selectCryptoError } from '../../store/slices/cryptoSlice';
import { formatCoinAmount } from '../../utils/formatters';
import { useToast } from '../common/ToastContainer';

interface HoldingFormData {
  coinId: string;
  coinName: string;
  amount: number;
  averageBuyPrice?: number;
}

interface HoldingFormProps {
  editingCoinId?: string;
  editingAmount?: number;
  editingAverageBuyPrice?: number;
  onSubmitSuccess?: () => void;
  onCancel?: () => void;
}

const HoldingForm: React.FC<HoldingFormProps> = memo(({
  editingCoinId,
  editingAmount,
  editingAverageBuyPrice,
  onSubmitSuccess,
  onCancel,
}) => {
  const dispatch = useAppDispatch();
  const searchResults = useAppSelector(selectSearchResults);
  const isSearching = useAppSelector(selectCryptoSearching);
  const searchError = useAppSelector(selectCryptoError);
  const existingHolding = useAppSelector((state) =>
    editingCoinId ? selectHoldingByCoinId(state, editingCoinId) : null
  );
  const { showError, showSuccess } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState<{
    id: string;
    name: string;
    symbol: string;
  } | null>(null);

  const isEditing = !!editingCoinId;

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<HoldingFormData>({
    defaultValues: {
      coinId: editingCoinId || '',
      coinName: '',
      amount: editingAmount || 0,
      averageBuyPrice: editingAverageBuyPrice || undefined,
    },
  });

  const watchedAmount = watch('amount');

  useEffect(() => {
    if (isEditing && existingHolding) {
      setSelectedCoin({
        id: existingHolding.coinId,
        name: existingHolding.coinId,
        symbol: existingHolding.coinId.toUpperCase(),
      });
      setValue('coinId', existingHolding.coinId);
      setValue('amount', editingAmount || existingHolding.amount);
      setValue('averageBuyPrice', editingAverageBuyPrice || existingHolding.averageBuyPrice);
    }
  }, [isEditing, existingHolding, editingAmount, editingAverageBuyPrice, setValue]);

  useEffect(() => {
    if (searchQuery.trim() && searchQuery.length >= 2 && !isEditing) {
      const timeoutId = setTimeout(() => {
        try {
          dispatch(searchCoins(searchQuery));
          setShowSearchResults(true);
        } catch (error) {
          console.error('Search error:', error);
          showError('Search Error', 'Failed to search cryptocurrencies. Please try again.');
        }
      }, 300);

      return () => clearTimeout(timeoutId);
    } else {
      setShowSearchResults(false);
      dispatch(clearSearchResults());
    }
  }, [searchQuery, dispatch, isEditing, showError]);

  useEffect(() => {
    if (searchError && typeof searchError === 'object' && (searchError as any).isSearchError) {
      showError('Search Failed', (searchError as any).message);
    }
  }, [searchError, showError]);

  const handleCoinSelect = useCallback((coin: { id: string; name: string; symbol: string }) => {
    setSelectedCoin(coin);
    setValue('coinId', coin.id);
    setValue('coinName', coin.name);
    setSearchQuery(coin.name);
    setShowSearchResults(false);
    dispatch(clearSearchResults());
  }, [setValue, dispatch]);

  const onSubmit = async (data: HoldingFormData) => {
    try {
      if (!selectedCoin && !isEditing) {
        showError('Validation Error', 'Please select a cryptocurrency.');
        return;
      }

      if (!data.amount || data.amount <= 0) {
        showError('Validation Error', 'Please enter a valid amount greater than 0.');
        return;
      }

      const holdingData = {
        coinId: data.coinId,
        amount: Number(data.amount),
        averageBuyPrice: data.averageBuyPrice ? Number(data.averageBuyPrice) : undefined,
      };

      if (isEditing) {
        dispatch(updateHolding(holdingData));
        showSuccess('Holding Updated', `Successfully updated your ${selectedCoin?.name || 'cryptocurrency'} holding.`);
      } else {
        dispatch(addHolding(holdingData));
        showSuccess('Holding Added', `Successfully added ${selectedCoin?.name || 'cryptocurrency'} to your portfolio.`);
      }

      reset();
      setSelectedCoin(null);
      setSearchQuery('');

      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (error) {
      console.error('Error submitting holding:', error);
      showError(
        'Save Error',
        `Failed to ${isEditing ? 'update' : 'add'} holding. Please try again.`
      );
    }
  };

  const handleCancel = useCallback(() => {
    reset();
    setSelectedCoin(null);
    setSearchQuery('');
    setShowSearchResults(false);
    dispatch(clearSearchResults());

    if (onCancel) {
      onCancel();
    }
  }, [reset, dispatch, onCancel]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        {isEditing ? 'Edit Holding' : 'Add New Holding'}
      </h3>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Coin Selection */}
        {!isEditing && (
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Cryptocurrency
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for a cryptocurrency..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              disabled={isSubmitting}
            />

            {/* Search Results Dropdown */}
            {showSearchResults && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {isSearching ? (
                  <div className="px-4 py-3 text-gray-500 dark:text-gray-400">
                    Searching...
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((coin) => (
                    <button
                      key={coin.id}
                      type="button"
                      onClick={() => handleCoinSelect(coin)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center space-x-3"
                    >
                      <img
                        src={coin.thumb}
                        alt={coin.name}
                        className="w-6 h-6 rounded-full"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder-coin.svg';
                        }}
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {coin.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                          {coin.symbol}
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-gray-500 dark:text-gray-400">
                    No results found
                  </div>
                )}
              </div>
            )}

            {/* Selected Coin Display */}
            {selectedCoin && (
              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
                <div className="flex items-center space-x-2">
                  <div className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Selected: {selectedCoin.name} ({selectedCoin.symbol.toUpperCase()})
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Amount *
          </label>
          <Controller
            name="amount"
            control={control}
            rules={{
              required: 'Amount is required',
              min: { value: 0.000001, message: 'Amount must be greater than 0' },
              validate: (value) => {
                if (isNaN(Number(value))) {
                  return 'Please enter a valid number';
                }
                return true;
              },
            }}
            render={({ field }) => (
              <input
                {...field}
                type="number"
                step="any"
                placeholder="0.00"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white ${errors.amount
                    ? 'border-red-300 dark:border-red-600'
                    : 'border-gray-300 dark:border-gray-600'
                  }`}
                disabled={isSubmitting}
              />
            )}
          />
          {errors.amount && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.amount.message}
            </p>
          )}
          {watchedAmount > 0 && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Formatted: {formatCoinAmount(Number(watchedAmount))}
            </p>
          )}
        </div>

        {/* Average Buy Price Input (Optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Average Buy Price (USD) <span className="text-gray-500">(Optional)</span>
          </label>
          <Controller
            name="averageBuyPrice"
            control={control}
            rules={{
              min: { value: 0, message: 'Price must be greater than or equal to 0' },
              validate: (value) => {
                if (value !== undefined && value !== null && isNaN(Number(value))) {
                  return 'Please enter a valid number';
                }
                return true;
              },
            }}
            render={({ field }) => (
              <input
                {...field}
                type="number"
                step="any"
                placeholder="0.00"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white ${errors.averageBuyPrice
                    ? 'border-red-300 dark:border-red-600'
                    : 'border-gray-300 dark:border-gray-600'
                  }`}
                disabled={isSubmitting}
              />
            )}
          />
          {errors.averageBuyPrice && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.averageBuyPrice.message}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Used for calculating profit/loss (optional feature)
          </p>
        </div>

        {/* Form Actions */}
        <div className="flex space-x-4 pt-4">
          <button
            type="submit"
            disabled={isSubmitting || (!selectedCoin && !isEditing)}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Holding' : 'Add Holding'}
          </button>

          {(onCancel || isEditing) && (
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
});

HoldingForm.displayName = 'HoldingForm';

export default HoldingForm;