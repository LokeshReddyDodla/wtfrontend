# Deployment Guide

This guide explains how to deploy the Weight Loss Agent Frontend to various platforms.

## 📦 Build for Production

```bash
# Install dependencies
npm install

# Build
npm run build
```

This creates optimized static files in `dist/public/`.

## 🚀 Deployment Options

### Option 1: Vercel (Recommended)

Vercel is the easiest option with zero configuration.

#### Steps:

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your repository
   - Vercel auto-detects the Vite configuration

3. **Configure Environment Variables**
   In Vercel dashboard:
   - Go to Project Settings → Environment Variables
   - Add:
     - `VITE_API_BASE_URL` = `https://your-backend.com`
     - `VITE_ENROLLMENT_ID` = `your-enrollment-id`

4. **Deploy**
   - Click "Deploy"
   - Vercel builds and deploys automatically
   - Get your URL: `https://your-app.vercel.app`

#### Vercel Configuration

The project includes `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist/public",
  "devCommand": "npm run dev",
  "installCommand": "npm install"
}
```

### Option 2: Netlify

Similar to Vercel, great for static sites.

#### Steps:

1. **Push to GitHub** (same as above)

2. **Connect to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect your repository

3. **Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist/public`

4. **Environment Variables**
   - Go to Site Settings → Build & Deploy → Environment
   - Add the same variables as Vercel

5. **Deploy**
   - Click "Deploy site"
   - Get your URL: `https://your-app.netlify.app`

### Option 3: Static Hosting (S3, CloudFlare Pages, etc.)

Deploy the built files to any static hosting service.

#### Steps:

1. **Build locally**
   ```bash
   npm run build
   ```

2. **Upload `dist/public/` folder** to:
   - AWS S3 + CloudFront
   - CloudFlare Pages
   - GitHub Pages
   - Azure Static Web Apps
   - Any static hosting

3. **Configure environment variables**
   - Create `.env.production` before building
   - Or use build-time replacement

### Option 4: Docker

Deploy using Docker containers.

#### Create Dockerfile:

```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist/public /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Create nginx.conf:

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy (optional)
    location /api {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

#### Build and run:

```bash
# Build image
docker build -t wtl-frontend .

# Run container
docker run -p 80:80 \
  -e VITE_API_BASE_URL=https://api.example.com \
  -e VITE_ENROLLMENT_ID=your-id \
  wtl-frontend
```

### Option 5: Integrated with Backend

Serve the frontend from the FastAPI backend.

#### Steps:

1. **Build frontend**
   ```bash
   cd /Users/lokeshreddydodla/Desktop/wtl-main
   npm run build
   ```

2. **Copy to backend**
   ```bash
   cp -r dist/public/* /Users/lokeshreddydodla/aihealth-server/static/
   ```

3. **Configure FastAPI** to serve static files:
   ```python
   from fastapi.staticfiles import StaticFiles
   
   app.mount("/", StaticFiles(directory="static", html=True), name="static")
   ```

4. **Deploy backend** - frontend is served automatically

## 🔧 Environment Variables for Production

### Required Variables

```bash
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_ENROLLMENT_ID=production-enrollment-id
```

### Different environments:

**.env.development** (for local dev):
```bash
VITE_API_BASE_URL=http://localhost:8000
VITE_ENROLLMENT_ID=dev-enrollment-id
```

**.env.production** (for production):
```bash
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_ENROLLMENT_ID=prod-enrollment-id
```

**.env.staging** (for staging):
```bash
VITE_API_BASE_URL=https://staging-api.yourdomain.com
VITE_ENROLLMENT_ID=staging-enrollment-id
```

## 🔒 Security Considerations

### 1. Environment Variables

⚠️ **IMPORTANT**: Never commit `.env.local` or any file with real enrollment IDs to Git!

The `.gitignore` already excludes:
- `.env.local`
- `.env*.local`

### 2. API Security

For production, implement:
- **Authentication**: JWT tokens or session cookies
- **Authorization**: Verify user can access their enrollment
- **HTTPS**: Always use HTTPS in production
- **CORS**: Configure backend to allow only your frontend domain

### 3. Enrollment ID

The current implementation uses a single enrollment ID from env var. For multi-user:

1. **User Authentication**
   - Login system
   - Store enrollment ID per user
   - Fetch from backend after login

2. **URL-based**
   - Use route params: `/dashboard/:enrollmentId`
   - Validate enrollment access on backend

## 📊 Performance Optimization

### Code Splitting

Vite automatically splits code. For manual control:

```typescript
// Lazy load components
const Dashboard = lazy(() => import('./components/Dashboard'));
```

### Asset Optimization

```bash
# Optimize images before deployment
npm install -g imagemin-cli
imagemin public/*.png --out-dir=public/optimized
```

### CDN

Serve static assets from CDN:
- Use Vercel/Netlify CDN (automatic)
- Or CloudFlare CDN
- Or AWS CloudFront

### Caching

Configure cache headers in `nginx.conf`:

```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## 🔍 Monitoring

### Analytics

Add analytics to track usage:

```typescript
// Google Analytics
import ReactGA from 'react-ga4';
ReactGA.initialize('G-XXXXXXXXXX');

// In Dashboard.tsx
useEffect(() => {
  ReactGA.send({ hitType: "pageview", page: window.location.pathname });
}, []);
```

### Error Tracking

Use Sentry for error tracking:

```bash
npm install @sentry/react
```

```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: import.meta.env.MODE,
});
```

## 🧪 Pre-deployment Checklist

- [ ] Build succeeds without errors: `npm run build`
- [ ] Type check passes: `npm run check`
- [ ] All environment variables configured
- [ ] Backend API is accessible from production
- [ ] CORS configured for production domain
- [ ] Test production build locally: `npm run preview`
- [ ] Error boundaries in place
- [ ] Analytics configured (if needed)
- [ ] Security headers configured
- [ ] HTTPS enabled
- [ ] Performance tested

## 🚨 Rollback Plan

If deployment fails:

### Vercel/Netlify
- Use their UI to rollback to previous deployment
- Or redeploy from previous Git commit

### Docker
```bash
# Rollback to previous image
docker pull wtl-frontend:previous-tag
docker run wtl-frontend:previous-tag
```

### Static Hosting
- Keep backup of previous `dist/` folder
- Re-upload previous version

## 📞 Support

For deployment issues:
1. Check build logs
2. Verify environment variables
3. Test backend connectivity
4. Check CORS configuration
5. Review browser console errors

## 🔄 CI/CD

### GitHub Actions Example

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run build
        env:
          VITE_API_BASE_URL: ${{ secrets.API_URL }}
          VITE_ENROLLMENT_ID: ${{ secrets.ENROLLMENT_ID }}
      - uses: actions/upload-artifact@v3
        with:
          name: dist
          path: dist/
```

---

**Backend Deployment**: See aihealth-server deployment docs
**Questions**: Contact DevOps team

