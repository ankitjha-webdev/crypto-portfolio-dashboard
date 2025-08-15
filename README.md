# Crypto Portfolio Dashboard

A responsive React.js application for tracking cryptocurrency prices and managing personal portfolios, built with Redux Toolkit for centralized state management and TailwindCSS for modern styling.

## Features

### Core Functionality
- **Real-time Cryptocurrency Tracking**: Live price updates every 30 seconds from CoinGecko API
- **Personal Portfolio Management**: Add, edit, and track your cryptocurrency holdings
- **Advanced Search & Filtering**: Search by name/symbol with debounced input and filter by market cap or price changes
- **Responsive Design**: Mobile-first approach with TailwindCSS responsive utilities
- **Dark/Light Theme Support**: Complete theme switching with persistent preferences

### Technical Features
- **Redux-Centralized State**: All data flows through Redux store with no direct API calls from components
- **Performance Optimized**: React.memo, useCallback, and normalized state structure
- **Error Handling**: Comprehensive error boundaries, toast notifications, and retry mechanisms
- **Rate Limiting**: Built-in API rate limiting with exponential backoff
- **TypeScript**: Full type safety throughout the application

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite 7
- **State Management**: Redux Toolkit with RTK Query patterns
- **Routing**: React Router v7
- **Styling**: TailwindCSS v4.1 with dark mode support
- **Forms**: React Hook Form with validation
- **API**: CoinGecko API v3 (free tier)
- **Code Quality**: ESLint + Prettier + TypeScript strict mode

## Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Git for version control

### Local Development Setup

1. **Clone the repository:**
```bash
git clone https://github.com/ankitjha-webdev/crypto-portfolio-dashboard.git
cd crypto-portfolio-dashboard
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start the development server:**
```bash
npm run dev
```

4. **Open your browser:**
Navigate to [http://localhost:5173](http://localhost:5173)

### Build for Production

```bash
# Type check the code
npm run type-check

# Build the application
npm run build

# Preview the production build locally
npm run preview
```

## Project Architecture

### Folder Structure

```
src/
├── components/
│   ├── common/              # Reusable UI components
│   │   ├── ErrorBoundary.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── SearchBar.tsx
│   │   ├── ThemeToggle.tsx
│   │   ├── Toast.tsx
│   │   └── ToastContainer.tsx
│   ├── dashboard/           # Dashboard-specific components
│   │   ├── CryptoTable.tsx
│   │   └── FilterControls.tsx
│   └── portfolio/           # Portfolio management components
│       ├── HoldingForm.tsx
│       ├── HoldingsList.tsx
│       └── PortfolioSummary.tsx
├── store/
│   ├── slices/              # Redux Toolkit slices
│   │   ├── cryptoSlice.ts   # Cryptocurrency data management
│   │   ├── portfolioSlice.ts # User portfolio state
│   │   └── uiSlice.ts       # UI state (theme, filters, search)
│   ├── middleware/          # Custom Redux middleware
│   │   ├── errorHandlingMiddleware.ts
│   │   ├── refreshMiddleware.ts
│   │   └── toastMiddleware.ts
│   └── index.ts             # Store configuration
├── services/
│   └── coinGeckoApi.ts      # CoinGecko API client with rate limiting
├── pages/
│   ├── Dashboard.tsx        # Main cryptocurrency dashboard
│   └── Portfolio.tsx        # Portfolio management page
├── hooks/                   # Custom React hooks
│   ├── useAppDispatch.ts    # Typed Redux dispatch hook
│   ├── useAppSelector.ts    # Typed Redux selector hook
│   ├── useErrorHandler.ts   # Error handling utilities
│   ├── useNetworkStatus.ts  # Network connectivity detection
│   ├── useRetry.ts          # Retry logic for failed operations
│   └── useThemeInitialization.ts
├── utils/                   # Utility functions
│   ├── constants.ts         # Application constants
│   ├── dataTransformers.ts  # Data transformation utilities
│   └── formatters.ts        # Number and currency formatters
└── styles/                  # Additional CSS styles
```

## Redux Architecture & State Management

### State Structure

The application uses a normalized Redux state structure for optimal performance:

```typescript 
// Root State Interface
interface RootState {

  crypto: CryptoState;
  portfolio: PortfolioState;
  ui: UIState;
}
```

### Redux Slices

#### 1. CryptoSlice (`src/store/slices/cryptoSlice.ts`)
Manages all cryptocurrency market data with normalized state structure:

```typescript
interface CryptoState {
  coins: Record<string, CoinData>;  // Normalized by coin ID
  coinIds: string[];               // Maintains display order
  loading: boolean;
  refreshing: boolean;             // Separate state for price updates
  error: string | null;
  lastUpdated: number;
  rateLimitStatus: {
    remaining: number;
    resetTime: number;
  };
}
```

**Key Actions:**
- `fetchCoins`: Initial data loading from CoinGecko API
- `refreshPrices`: Periodic price updates (every 30 seconds)
- `updateRateLimitStatus`: Track API usage

#### 2. PortfolioSlice (`src/store/slices/portfolioSlice.ts`)
Manages user's cryptocurrency holdings and calculations:

```typescript
interface PortfolioState {
  holdings: Record<string, Holding>;  // Keyed by coin ID
  totalValue: number;
  totalChange24h: number;
  lastCalculated: number;
}

interface Holding {
  coinId: string;
  amount: number;
  averageBuyPrice?: number;
}
```

**Key Features:**
- Automatic portfolio value recalculation when crypto prices update
- Persistent storage in localStorage
- Real-time 24h change tracking

#### 3. UISlice (`src/store/slices/uiSlice.ts`)
Controls user interface state and preferences:

```typescript
interface UIState {
  searchQuery: string;
  filters: {
    marketCapFilter: 'all' | 'top10' | 'top50';
    priceChangeFilter: 'all' | 'positive' | 'negative';
  };
  theme: 'light' | 'dark';
  sortConfig: {
    key: string;
    direction: 'asc' | 'desc';
  };
}
```

### Custom Middleware

#### 1. Refresh Middleware (`src/store/middleware/refreshMiddleware.ts`)
- Automatically triggers price updates every 30 seconds
- Pauses updates when the browser tab is not active
- Handles rate limiting and error recovery

#### 2. Error Handling Middleware (`src/store/middleware/errorHandlingMiddleware.ts`)
- Centralized error processing for all async thunks
- Automatic retry logic with exponential backoff
- Error categorization and user-friendly messaging

#### 3. Toast Middleware (`src/store/middleware/toastMiddleware.ts`)
- Displays success/error notifications based on Redux actions
- Non-intrusive user feedback system

### Selectors and Performance

The application uses memoized selectors for optimal performance:

```typescript
// Example: Filtered and sorted coins selector
const selectFilteredCoins = createSelector(
  [selectAllCoins, selectSearchQuery, selectFilters],
  (coins, searchQuery, filters) => {
    // Expensive filtering logic runs only when dependencies change
    return applyFiltersAndSearch(coins, searchQuery, filters);
  }
);
```

## CoinGecko API Integration

### API Client Architecture

The `CoinGeckoService` class (`src/services/coinGeckoApi.ts`) provides a robust API client with:

#### Rate Limiting
- **Free Tier Limits**: 10-50 calls per minute
- **Request Queue**: Automatic queuing with intelligent throttling
- **Backoff Strategy**: Exponential backoff for failed requests (2s, 4s, 8s)

#### Error Handling
- **Network Errors**: Automatic retry for connectivity issues
- **Server Errors**: Retry logic for 5xx responses
- **Rate Limit Errors**: Intelligent waiting based on `Retry-After` headers

#### Key Methods

```typescript
// Primary data fetching
await coinGeckoApi.fetchCoins(50);  // Market data for top 50 coins

// Lightweight price updates
await coinGeckoApi.fetchSimplePrices(['bitcoin', 'ethereum']);

// Detailed coin information
await coinGeckoApi.fetchCoinDetails('bitcoin');

// Search functionality
await coinGeckoApi.searchCoins('bitcoin');
```

### API Endpoints Used

1. **`/coins/markets`**: Primary market data (price, market cap, 24h change)
2. **`/simple/price`**: Lightweight price updates for portfolio calculations
3. **`/coins/{id}`**: Detailed coin information
4. **`/search`**: Coin search by name or symbol

### Data Flow

```
Component Mount → Redux Thunk → API Client → Rate Limiting → 
CoinGecko API → Data Normalization → Redux State → Component Update
```

## Available Scripts

### Development
- `npm run dev` - Start development server with hot reload
- `npm run type-check` - Run TypeScript type checking
- `npm run lint` - Run ESLint for code quality
- `npm run lint:fix` - Auto-fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

### Production
- `npm run build` - Build optimized production bundle
- `npm run build:production` - Build with production environment variables
- `npm run preview` - Preview production build locally
- `npm run preview:production` - Build and preview production version

### Deployment
- `npm run deploy` - Deploy to Vercel production
- `npm run deploy:preview` - Deploy to Vercel preview environment

## Usage Examples

### Adding a Cryptocurrency to Portfolio

1. Navigate to the Portfolio page (`/portfolio`)
2. Use the "Add Holding" form to select a cryptocurrency
3. Enter the amount you own
4. The portfolio value updates automatically with real-time prices

### Searching and Filtering

1. Use the search bar on the Dashboard to find specific coins
2. Apply filters:
   - **Market Cap**: Top 10, Top 50, or All
   - **Price Change**: Positive, Negative, or All changes
3. Filters persist across page navigation

### Theme Switching

1. Click the theme toggle button in the header
2. Theme preference is saved to localStorage
3. All components automatically adapt to the selected theme

## Development Guidelines

### Code Style
- **TypeScript**: Use strict mode with proper type definitions
- **Components**: Functional components with hooks
- **State Management**: All state changes through Redux actions
- **Styling**: TailwindCSS utility classes with semantic naming

### Performance Best Practices
- Use `React.memo` for components with stable props
- Implement `useCallback` for event handlers passed to children
- Apply `useMemo` for expensive calculations
- Utilize normalized state structure to prevent unnecessary re-renders

### Error Handling
- Wrap components in error boundaries
- Use try-catch blocks in async thunks
- Provide user-friendly error messages
- Implement retry mechanisms for failed operations

### Commit Message Convention
```
feat: add portfolio value calculation
fix: resolve API rate limiting issues
docs: update README with deployment instructions
style: improve responsive design for mobile
refactor: normalize Redux state structure
test: add unit tests for crypto slice
```

## Theme System

The application implements a comprehensive dark/light theme system:

### Implementation
- **TailwindCSS Dark Mode**: Uses class-based dark mode strategy
- **Theme Persistence**: Stored in localStorage and Redux state
- **System Preference**: Respects user's OS theme preference on first visit
- **Smooth Transitions**: CSS transitions for theme switching

### Usage in Components
```tsx
// Theme-aware styling with TailwindCSS
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  <h1 className="text-blue-600 dark:text-blue-400">Dashboard</h1>
</div>
```

## Responsive Design

### Breakpoint Strategy
- **Mobile First**: Base styles for mobile devices
- **Tablet**: `md:` prefix for tablet-specific styles
- **Desktop**: `lg:` and `xl:` prefixes for larger screens

### Key Responsive Features
- Collapsible navigation on mobile
- Responsive table layouts with horizontal scrolling
- Adaptive typography and spacing
- Touch-friendly interactive elements

## Deployment

### Vercel Deployment (Recommended)

This application is optimized for deployment on Vercel with automatic builds from Git repository.

#### Prerequisites
- Vercel account (free tier available)
- Git repository (GitHub, GitLab, or Bitbucket)
- Vercel CLI installed globally: `npm install -g vercel`

#### Automatic Deployment Setup

1. **Connect Repository to Vercel:**
   - Visit [vercel.com](https://vercel.com) and sign in
   - Click "New Project" and import your Git repository
   - Vercel will automatically detect the Vite framework

2. **Configure Environment Variables:**
   - In Vercel dashboard, go to Project Settings → Environment Variables
   - Add the following variables:
   ```
   NODE_ENV=production
   VITE_COINGECKO_API_URL=https://api.coingecko.com/api/v3
   VITE_ENABLE_REALTIME_UPDATES=true
   VITE_UPDATE_INTERVAL=30000
   ```

3. **Deploy:**
   - Push to your main branch to trigger automatic deployment
   - Vercel will build and deploy your application automatically

#### Manual Deployment with Vercel CLI

1. **Login to Vercel:**
```bash
vercel login
```

2. **Deploy to Preview:**
```bash
npm run deploy:preview
```

3. **Deploy to Production:**
```bash
npm run deploy
```

#### Vercel Configuration

The project includes a `vercel.json` configuration file with:

- **SPA Routing**: All routes redirect to `index.html` for React Router
- **Asset Caching**: Optimized cache headers for static assets
- **Build Optimization**: Automatic Vite build configuration
- **Environment Variables**: Production environment setup

#### Build Optimizations

The Vite configuration includes production optimizations:

```typescript
// vite.config.ts optimizations
{
  build: {
    minify: 'terser',           // Advanced minification
    sourcemap: false,           // Disable sourcemaps for production
    rollupOptions: {
      output: {
        manualChunks: {         // Code splitting for better caching
          vendor: ['react', 'react-dom'],
          redux: ['@reduxjs/toolkit', 'react-redux'],
          router: ['react-router-dom'],
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Optimized chunk size
  }
}
```

#### Performance Features

- **Code Splitting**: Vendor libraries separated for optimal caching
- **Asset Optimization**: Images and static files optimized for web
- **Gzip Compression**: Automatic compression on Vercel
- **CDN Distribution**: Global CDN for fast loading worldwide
- **Cache Headers**: Long-term caching for static assets

#### Environment Variables

Create a `.env.production` file for production-specific settings:

```bash
NODE_ENV=production
VITE_COINGECKO_API_URL=https://api.coingecko.com/api/v3
VITE_ENABLE_REALTIME_UPDATES=true
VITE_UPDATE_INTERVAL=30000
```

#### Deployment Checklist

- [ ] Repository connected to Vercel
- [ ] Environment variables configured
- [ ] Build passes locally (`npm run build`)
- [ ] Preview deployment tested
- [ ] Production deployment verified
- [ ] API functionality tested on live site
- [ ] Responsive design verified on mobile
- [ ] Theme switching works correctly
- [ ] Portfolio functionality tested

#### Alternative Deployment Options

**Netlify:**
- Similar to Vercel with automatic Git integration
- Configure build command: `npm run build`
- Publish directory: `dist`
- Add `_redirects` file for SPA routing

**GitHub Pages:**
- Requires additional configuration for SPA routing
- Use `gh-pages` package for deployment
- Configure base URL in `vite.config.ts`

**Docker Deployment:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## Troubleshooting

### Common Issues

#### API Rate Limiting
**Problem**: "Too Many Requests" errors
**Solution**: The app automatically handles rate limiting, but you can check status in Redux DevTools

#### Build Errors
**Problem**: TypeScript compilation errors
**Solution**: Run `npm run type-check` to identify and fix type issues

#### Performance Issues
**Problem**: Slow rendering with large datasets
**Solution**: The app uses React.memo and normalized state, but consider reducing the number of displayed coins

### Development Tips
- Use Redux DevTools extension for state debugging
- Enable React Developer Tools for component inspection
- Check browser Network tab for API request monitoring
- Use Lighthouse for performance auditing
