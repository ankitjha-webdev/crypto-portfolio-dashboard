import { describe, test, expect } from 'vitest';
import uiReducer, { setSearchQuery, setMarketCapFilter, toggleSort } from '../store/slices/uiSlice';

describe('uiSlice', () => {
  test('handles initial state', () => {
    const state = uiReducer(undefined as any, { type: '@@INIT' });
    expect(state.searchQuery).toBe('');
    expect(state.filters.marketCapFilter).toBe('all');
  });

  test('setSearchQuery updates search', () => {
    const action = setSearchQuery('eth');
    const state = uiReducer(undefined as any, action);
    expect(state.searchQuery).toBe('eth');
  });

  test('setMarketCapFilter updates filter', () => {
    const action = setMarketCapFilter('top10');
    const state = uiReducer(undefined as any, action);
    expect(state.filters.marketCapFilter).toBe('top10');
  });

  test('toggleSort toggles direction for same key', () => {
    const state1 = uiReducer(undefined as any, toggleSort('market_cap_rank'));
    expect(state1.sortConfig.direction).toBe('desc');
    const state2 = uiReducer(state1, toggleSort('market_cap_rank'));
    expect(state2.sortConfig.direction).toBe('asc');
  });
});


