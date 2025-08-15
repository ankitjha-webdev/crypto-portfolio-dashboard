# Deployment Guide

## Pre-Deployment Checklist

### Code Quality
- [ ] All TypeScript errors resolved (`npm run type-check`)
- [ ] ESLint passes without errors (`npm run lint`)
- [ ] Code formatted with Prettier (`npm run format:check`)
- [ ] Production build successful (`npm run build:production`)
- [ ] Preview works locally (`npm run preview`)

### Environment Configuration
- [ ] `.env.production` file created with production values
- [ ] Environment variables documented in `.env.example`
- [ ] No sensitive data in environment files
- [ ] API endpoints configured for production

### Performance Optimization
- [ ] Bundle size optimized (check build output)
- [ ] Code splitting implemented (vendor, redux, router chunks)
- [ ] Static assets optimized
- [ ] Unused dependencies removed

### Functionality Testing
- [ ] Dashboard loads and displays cryptocurrency data
- [ ] Search functionality works
- [ ] Filtering (Top 10/50, price changes) works
- [ ] Portfolio management (add/edit/delete holdings) works
- [ ] Theme switching works correctly
- [ ] Responsive design tested on mobile/tablet/desktop
- [ ] Error handling works (network errors, API failures)
- [ ] Real-time updates function properly

## Vercel Deployment Steps

### 1. Repository Setup
```bash
# Ensure code is committed and pushed
git add .
git commit -m "feat: add Vercel deployment configuration"
git push origin main
```

### 2. Vercel Dashboard Setup
1. Visit [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your Git repository
4. Vercel will auto-detect Vite framework

### 3. Environment Variables Configuration
In Vercel Project Settings → Environment Variables, add:

```
NODE_ENV=production
VITE_COINGECKO_API_URL=https://api.coingecko.com/api/v3
VITE_ENABLE_REALTIME_UPDATES=true
VITE_UPDATE_INTERVAL=30000
```

### 4. Build Settings (Auto-configured)
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 5. Deploy
- Push to main branch for automatic deployment
- Or use Vercel CLI: `npm run deploy`

## Manual Deployment with Vercel CLI

### Prerequisites
```bash
npm install -g vercel
vercel login
```

### Deploy to Preview
```bash
npm run deploy:preview
```

### Deploy to Production
```bash
npm run deploy
```

## Post-Deployment Verification

### Functionality Tests
- [ ] Application loads without errors
- [ ] API calls work (check Network tab)
- [ ] All routes accessible (dashboard, portfolio)
- [ ] Search and filtering functional
- [ ] Portfolio management works
- [ ] Theme switching works
- [ ] Mobile responsiveness verified
- [ ] Performance acceptable (Lighthouse score)

### Performance Checks
- [ ] Initial load time < 3 seconds
- [ ] API response times acceptable
- [ ] No console errors
- [ ] Proper caching headers
- [ ] Gzip compression enabled

### SEO and Accessibility
- [ ] Meta tags present
- [ ] Proper heading structure
- [ ] Alt text for images
- [ ] Keyboard navigation works
- [ ] Color contrast acceptable

## Troubleshooting

### Common Issues

#### Build Failures
- **TypeScript errors**: Run `npm run type-check` locally
- **Missing dependencies**: Ensure all dependencies in package.json
- **Environment variables**: Check Vercel dashboard configuration

#### Runtime Errors
- **API failures**: Verify CoinGecko API endpoint and rate limits
- **Routing issues**: Ensure `vercel.json` rewrites configured
- **Theme not persisting**: Check localStorage access

#### Performance Issues
- **Large bundle size**: Review chunk splitting in `vite.config.ts`
- **Slow API calls**: Implement proper caching and error handling
- **Memory leaks**: Check for proper cleanup in useEffect hooks

### Debug Commands
```bash
# Check build locally
npm run build:production

# Test production build
npm run preview:production

# Check bundle analysis
npm run build -- --analyze

# Verify environment variables
echo $NODE_ENV
```

## Alternative Deployment Options

### Netlify
1. Connect Git repository
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add `_redirects` file: `/* /index.html 200`

### GitHub Pages
1. Install gh-pages: `npm install --save-dev gh-pages`
2. Add script: `"deploy:gh": "gh-pages -d dist"`
3. Configure base URL in `vite.config.ts`
4. Run: `npm run build && npm run deploy:gh`

### Docker
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

## Monitoring and Maintenance

### Performance Monitoring
- Set up Vercel Analytics
- Monitor Core Web Vitals
- Track API response times
- Monitor error rates

### Regular Updates
- Update dependencies monthly
- Monitor CoinGecko API changes
- Review and optimize bundle size
- Update security patches

### Backup Strategy
- Regular Git commits
- Environment variable backup
- Database backup (if applicable)
- Deployment configuration backup