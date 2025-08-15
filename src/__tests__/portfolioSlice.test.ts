import { describe, test, expect } from 'vitest';
import portfolioReducer, { addHolding, updateHolding, removeHolding } from '../store/slices/portfolioSlice';

describe('portfolioSlice', () => {
  test('handles initial state', () => {
    const state = portfolioReducer(undefined as any, { type: '@@INIT' });
    expect(state.holdings).toBeDefined();
    expect(state.totalValue).toBe(0);
  });

  test('addHolding adds a new holding', () => {
    const action = addHolding({ coinId: 'bitcoin', amount: 1 });
    const state = portfolioReducer(undefined as any, action);
    expect(state.holdings.bitcoin.amount).toBe(1);
  });

  test('updateHolding updates existing holding', () => {
    const addAction = addHolding({ coinId: 'bitcoin', amount: 1 });
    const state1 = portfolioReducer(undefined as any, addAction);
    const updateAction = updateHolding({ coinId: 'bitcoin', amount: 2 });
    const state2 = portfolioReducer(state1, updateAction);
    expect(state2.holdings.bitcoin.amount).toBe(2);
  });

  test('removeHolding removes holding', () => {
    const addAction = addHolding({ coinId: 'bitcoin', amount: 1 });
    const state1 = portfolioReducer(undefined as any, addAction);
    const removeAction = removeHolding('bitcoin');
    const state2 = portfolioReducer(state1, removeAction);
    expect(state2.holdings.bitcoin).toBeUndefined();
  });
});


