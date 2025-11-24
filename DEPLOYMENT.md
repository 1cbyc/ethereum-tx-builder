# Deployment Guide - Ethereum TX Builder

## Deploy to Vercel (Recommended)

Vercel is perfect for React applications and provides:
- Free hosting with HTTPS
- Automatic deployments from GitHub
- Global CDN
- Easy custom domains

### Option 1: Deploy via Vercel Dashboard (Easiest)

1. **Push your code to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Go to Vercel**:
   - Visit [vercel.com](https://vercel.com)
   - Sign up/Login with your GitHub account

3. **Import your project**:
   - Click "New Project"
   - Select your `ethereum-tx-builder` repository
   - Vercel will auto-detect the settings from `vercel.json`

4. **Configure (if needed)**:
   - **Framework Preset**: Other
   - **Build Command**: `npm run build` (already set in vercel.json)
   - **Output Directory**: `dist` (already set in vercel.json)
   - **Install Command**: `npm install --legacy-peer-deps` (already set)

5. **Deploy**:
   - Click "Deploy"
   - Wait for build to complete (~2-3 minutes)
   - Your app will be live at `https://your-project-name.vercel.app`

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```
   
   Follow the prompts:
   - Link to existing project? **No** (first time)
   - Project name: `ethereum-tx-builder` (or your choice)
   - Directory: `./dist` (or just press Enter, it's auto-detected)
   - Override settings? **No**

4. **Deploy to production**:
   ```bash
   vercel --prod
   ```

### After Deployment

Your app will be available at:
- **Preview URL**: `https://ethereum-tx-builder-xxx.vercel.app`
- **Production URL**: `https://ethereum-tx-builder.vercel.app` (after first production deploy)

### Custom Domain (Optional)

1. Go to your project dashboard on Vercel
2. Click "Settings" → "Domains"
3. Add your custom domain (e.g., `txbuilder.yourdomain.com`)
4. Follow DNS configuration instructions

## Alternative: Deploy to Netlify

If you prefer Netlify:

1. **Push to GitHub** (same as above)

2. **Go to Netlify**:
   - Visit [netlify.com](https://netlify.com)
   - Sign up/Login with GitHub

3. **New site from Git**:
   - Select your repository
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Advanced**: Add environment variable `NPM_FLAGS=--legacy-peer-deps`

4. **Deploy**

## Build Verification

Before deploying, test the build locally:

```bash
# Install dependencies
npm install --legacy-peer-deps

# Build for production
npm run build

# The dist/ folder should contain:
# - index.html
# - src.js (and vendor.js, manifest.js)
# - style.js
# - All assets (images, fonts, etc.)
```

## Troubleshooting

### Build fails on Vercel
- Check that `vercel.json` is in the root directory
- Ensure `package.json` has the correct build script
- Check Vercel build logs for specific errors

### App shows blank page
- Check browser console for errors
- Ensure all asset paths are correct
- Verify `index.html` references the correct JS/CSS files

### CORS or API issues
- Etherscan API should work fine from browser
- No CORS issues expected as it's a client-side app

## Environment Variables (if needed)

If you need to add environment variables:
1. Go to Vercel project settings
2. Click "Environment Variables"
3. Add any needed variables (currently none required)

## Continuous Deployment

Once connected to GitHub:
- Every push to `main` branch = automatic production deployment
- Every pull request = preview deployment
- No manual steps needed!

## Notes

- The app is 100% client-side, so no server configuration needed
- All data (wallets, settings) stored in browser localStorage
- Works offline (except for API calls to Etherscan)

