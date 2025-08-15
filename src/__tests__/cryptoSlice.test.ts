import { describe, test, expect } from 'vitest';
import cryptoReducer, { fetchCoins } from '../store/slices/cryptoSlice';

describe('cryptoSlice', () => {
  test('handles initial state', () => {
    const state = cryptoReducer(undefined as any, { type: '@@INIT' });
    expect(state.loading).toBe(false);
    expect(state.coins).toEqual({});
    expect(state.coinIds).toEqual([]);
  });

  test('handles fetchCoins.pending', () => {
    const pendingAction = { type: fetchCoins.pending.type };
    const state = cryptoReducer(undefined as any, pendingAction);
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  test('handles fetchCoins.fulfilled', () => {
    const payload = [
      {
        id: 'bitcoin',
        name: 'Bitcoin',
        symbol: 'BTC',
        image: 'btc.png',
        current_price: 50000,
        price_change_percentage_24h: 2,
        market_cap: 1000000,
        market_cap_rank: 1,
      },
      {
        id: 'ethereum',
        name: 'Ethereum',
        symbol: 'ETH',
        image: 'eth.png',
        current_price: 3000,
        price_change_percentage_24h: -1,
        market_cap: 500000,
        market_cap_rank: 2,
      },
    ];
    const fulfilledAction = { type: fetchCoins.fulfilled.type, payload };
    const state = cryptoReducer(undefined as any, fulfilledAction);
    expect(state.loading).toBe(false);
    expect(state.coinIds).toEqual(['bitcoin', 'ethereum']);
    expect(state.coins.bitcoin.current_price).toBe(50000);
  });
});


