# Production Deployment Checklist

## ✅ Pre-Deployment

### Environment Configuration
- [ ] Create `.env.production` or `.env.local` with production API URL
- [ ] Update `VITE_API_BASE_URL` to point to production backend
- [ ] Verify all environment variables are set correctly

### Code Quality
- [ ] Run `npm run build` successfully
- [ ] Test the production build locally with `npm run preview`
- [ ] Verify all features work in production build
- [ ] Check browser console for errors

### Assets & Resources
- [ ] All images optimized for web
- [ ] Favicon configured correctly
- [ ] No console.log statements in production code (or use conditional logging)

## 🏗️ Build & Deploy

### Build Process
```bash
# Install dependencies
npm install

# Build for production
npm run build

# Preview build locally (optional)
npm run preview
```

### Deployment Options

#### Option 1: Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### Option 2: Netlify
```bash
# Build command: npm run build
# Publish directory: dist/public
```

#### Option 3: Custom Server
```bash
# Build the project
npm run build

# Serve the dist/public folder with any static server
# Example with serve:
npx serve dist/public
```

## 🔒 Security

- [ ] API endpoints use HTTPS in production
- [ ] CORS configured correctly on backend
- [ ] Sensitive data not exposed in frontend code
- [ ] Environment variables properly configured
- [ ] No hardcoded credentials or API keys

## 🎯 Performance

- [ ] Lazy loading implemented where appropriate
- [ ] Images properly sized and compressed
- [ ] Bundle size optimized (check build output)
- [ ] CDN configured if needed

## 📊 Monitoring

- [ ] Error tracking set up (e.g., Sentry)
- [ ] Analytics configured (if required)
- [ ] Performance monitoring enabled
- [ ] User feedback mechanism in place

## 🧪 Testing

### Functional Tests
- [ ] User can enter enrollment ID
- [ ] Upload InBody reports works
- [ ] Charts display correctly with data
- [ ] Comparison cards show accurate data
- [ ] Chat interface responds properly
- [ ] All tabs (Overview, Reports, Health) work
- [ ] Logout/Clear enrollment works

### Browser Tests
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

### Responsive Design
- [ ] Desktop (1920px+)
- [ ] Laptop (1366px)
- [ ] Tablet (768px)
- [ ] Mobile (375px)

## 📝 Documentation

- [ ] README.md updated with production instructions
- [ ] API documentation accessible in `/guide` folder
- [ ] Environment setup documented
- [ ] Troubleshooting guide available

## 🚀 Post-Deployment

- [ ] Verify production URL is accessible
- [ ] Test all features in production environment
- [ ] Monitor error logs for first 24-48 hours
- [ ] Gather user feedback
- [ ] Document any issues or learnings

## 🔄 Rollback Plan

In case of issues:
1. Keep previous build available
2. Have backend rollback procedure ready
3. Monitor error rates closely
4. Be prepared to revert quickly

## 📞 Support

- Backend API: Ensure backend team is ready
- Frontend Issues: Monitor console and error tracking
- User Support: Have support channel ready

---

## Quick Commands Reference

```bash
# Development
npm run dev

# Build
npm run build

# Preview production build
npm run preview

# Lint & Format
npm run lint
npm run format

# Clean build
rm -rf dist node_modules
npm install
npm run build
```

## Environment Variables

### Development (.env.local)
```env
VITE_API_BASE_URL=http://localhost:8000
```

### Production
```env
VITE_API_BASE_URL=https://your-production-api.com
```

---

**Remember**: Test thoroughly before deploying to production! 🎯

