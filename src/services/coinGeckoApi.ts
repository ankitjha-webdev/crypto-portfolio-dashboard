import type { CoinData } from '../store/slices/cryptoSlice';

export interface ApiError {
    message: string;
    code?: string | number;
    timestamp: number;
    retryAfter?: number;
}

interface RateLimitConfig {
    maxRequests: number;
    windowMs: number;
    retryAfter: number;
}

interface QueuedRequest {
    url: string;
    options?: RequestInit;
    resolve: (value: any) => void;
    reject: (reason: any) => void;
    retryCount: number;
    timestamp: number;
}

class CoinGeckoService {
    private static instance: CoinGeckoService;
    private baseUrl = 'https://api.coingecko.com/api/v3';
    private requestQueue: QueuedRequest[] = [];
    private isProcessingQueue = false;
    private lastRequestTime = 0;

    private rateLimitConfig: RateLimitConfig = {
        maxRequests: 10,
        windowMs: 60000, // 1 minute
        retryAfter: 6000, // 6 seconds between requests
    };

    private requestHistory: number[] = [];

    private constructor() { }

    public static getInstance(): CoinGeckoService {
        if (!CoinGeckoService.instance) {
            CoinGeckoService.instance = new CoinGeckoService();
        }
        return CoinGeckoService.instance;
    }

    private isWithinRateLimit(): boolean {
        const now = Date.now();
        const windowStart = now - this.rateLimitConfig.windowMs;

        // Clean old requests from history
        this.requestHistory = this.requestHistory.filter(time => time > windowStart);

        return this.requestHistory.length < this.rateLimitConfig.maxRequests;
    }

    private recordRequest(): void {
        this.requestHistory.push(Date.now());
        this.lastRequestTime = Date.now();
    }

    private getDelayUntilNextRequest(): number {
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        const minDelay = this.rateLimitConfig.retryAfter;

        if (timeSinceLastRequest < minDelay) {
            return minDelay - timeSinceLastRequest;
        }

        if (!this.isWithinRateLimit()) {
            const oldestRequest = Math.min(...this.requestHistory);
            const timeUntilWindowReset = this.rateLimitConfig.windowMs - (now - oldestRequest);
            return Math.max(timeUntilWindowReset, minDelay);
        }

        return 0;
    }

    private async processQueue(): Promise<void> {
        if (this.isProcessingQueue || this.requestQueue.length === 0) {
            return;
        }

        this.isProcessingQueue = true;

        while (this.requestQueue.length > 0) {
            const delay = this.getDelayUntilNextRequest();

            if (delay > 0) {
                await new Promise(resolve => setTimeout(resolve, delay));
            }

            const request = this.requestQueue.shift();
            if (!request) continue;

            try {
                this.recordRequest();
                const response = await this.executeRequest(request.url, request.options);
                request.resolve(response);
            } catch (error) {
                // Implement exponential backoff for retries
                if (request.retryCount < 3 && this.shouldRetry(error)) {
                    request.retryCount++;
                    const backoffDelay = Math.pow(2, request.retryCount) * 1000; // 2s, 4s, 8s

                    setTimeout(() => {
                        this.requestQueue.unshift(request);
                        if (!this.isProcessingQueue) {
                            this.processQueue();
                        }
                    }, backoffDelay);
                } else {
                    request.reject(error);
                }
            }
        }

        this.isProcessingQueue = false;
    }

    private shouldRetry(error: any): boolean {
        if (error instanceof TypeError && error.message.includes('fetch')) {
            return true; // Network errors
        }

        if (error.status >= 500) {
            return true;
        }

        if (error.status === 429) {
            return true;
        }

        return false;
    }

    private async executeRequest(url: string, options?: RequestInit): Promise<any> {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                ...options?.headers,
            },
        });

        if (!response.ok) {
            const errorData: ApiError = {
                message: `HTTP ${response.status}: ${response.statusText}`,
                code: response.status,
                timestamp: Date.now(),
            };

            if (response.status === 429) {
                const retryAfter = response.headers.get('Retry-After');
                if (retryAfter) {
                    errorData.retryAfter = parseInt(retryAfter) * 1000;
                }
            }

            throw errorData;
        }

        return response.json();
    }

    private async makeRequest(endpoint: string, options?: RequestInit): Promise<any> {
        const url = `${this.baseUrl}${endpoint}`;

        return new Promise((resolve, reject) => {
            this.requestQueue.push({
                url,
                options,
                resolve,
                reject,
                retryCount: 0,
                timestamp: Date.now(),
            });

            this.processQueue();
        });
    }

    public async fetchCoins(limit: number = 50): Promise<CoinData[]> {
        try {
            const endpoint = `/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false&price_change_percentage=24h`;
            const data = await this.makeRequest(endpoint);

            return this.normalizeCoinData(data);
        } catch (error) {
            throw this.createApiError(error, 'Failed to fetch coins');
        }
    }

    public async fetchSimplePrices(coinIds: string[]): Promise<Record<string, any>> {
        try {
            const idsString = coinIds.join(',');
            const endpoint = `/simple/price?ids=${idsString}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true`;
            const data = await this.makeRequest(endpoint);

            return data;
        } catch (error) {
            throw this.createApiError(error, 'Failed to fetch prices');
        }
    }

    public async fetchCoinDetails(coinId: string): Promise<any> {
        try {
            const endpoint = `/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`;
            const data = await this.makeRequest(endpoint);

            return data;
        } catch (error) {
            throw this.createApiError(error, `Failed to fetch details for ${coinId}`);
        }
    }

    public async searchCoins(query: string): Promise<any[]> {
        try {
            const endpoint = `/search?query=${encodeURIComponent(query)}`;
            const data = await this.makeRequest(endpoint);

            return data.coins || [];
        } catch (error) {
            throw this.createApiError(error, 'Failed to search coins');
        }
    }

    public async fetchHistoricalData(coinId: string, days: number): Promise<any> {
        try {
            const endpoint = `/coins/${coinId}/market_chart?vs_currency=usd&days=${days}&interval=${this.getInterval(days)}`;
            const data = await this.makeRequest(endpoint);

            return this.normalizeHistoricalData(data);
        } catch (error) {
            throw this.createApiError(error, `Failed to fetch historical data for ${coinId}`);
        }
    }

    private getInterval(days: number): string {
        if (days <= 1) return 'hourly';
        if (days <= 90) return 'daily';
        return 'daily';
    }

    private normalizeHistoricalData(data: any): { prices: Array<[number, number]>; market_caps: Array<[number, number]>; total_volumes: Array<[number, number]> } {
        return {
            prices: data.prices || [],
            market_caps: data.market_caps || [],
            total_volumes: data.total_volumes || []
        };
    }

    private normalizeCoinData(coins: any[]): CoinData[] {
        return coins.map(coin => ({
            id: coin.id,
            name: coin.name,
            symbol: coin.symbol.toUpperCase(),
            image: coin.image,
            current_price: coin.current_price || 0,
            price_change_percentage_24h: coin.price_change_percentage_24h || 0,
            market_cap: coin.market_cap || 0,
            market_cap_rank: coin.market_cap_rank || 0,
        }));
    }

    private createApiError(error: any, defaultMessage: string): ApiError {
        if (error && typeof error === 'object' && 'message' in error) {
            return error as ApiError;
        }

        return {
            message: error instanceof Error ? error.message : defaultMessage,
            timestamp: Date.now(),
        };
    }

    public getRateLimitStatus(): { remaining: number; resetTime: number } {
        const now = Date.now();
        const windowStart = now - this.rateLimitConfig.windowMs;
        const recentRequests = this.requestHistory.filter(time => time > windowStart);

        return {
            remaining: Math.max(0, this.rateLimitConfig.maxRequests - recentRequests.length),
            resetTime: recentRequests.length > 0 ? Math.min(...recentRequests) + this.rateLimitConfig.windowMs : now,
        };
    }

    public clearHistory(): void {
        this.requestHistory = [];
        this.requestQueue = [];
        this.lastRequestTime = 0;
    }
}

export const coinGeckoApi = CoinGeckoService.getInstance();
export default coinGeckoApi;