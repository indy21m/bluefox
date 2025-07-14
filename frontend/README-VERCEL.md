# Vercel Deployment via GitHub

## Quick Deploy Steps:

1. **Commit and push your changes**:
```bash
cd /Users/mario/Personal/AI\ Apps/bluefox
git add .
git commit -m "Add Vercel deployment configuration"
git push origin main
```

2. **Go to Vercel Dashboard**:
   - Visit [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click on your `bluefox-rho` project
   - Go to **Settings** → **Git**
   - Connect your GitHub repository if not already connected

3. **Trigger Redeployment**:
   - Go to **Deployments** tab
   - Click **Redeploy** on the latest deployment
   - Or push a new commit to trigger automatic deployment

4. **Check Build Settings**:
   - In Settings → General
   - Ensure **Root Directory** is set to `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. **Set Environment Variables**:
   - Go to Settings → Environment Variables
   - Add: `CONVERTKIT_API_KEY` with your API key value

## Debugging 404 Error:

If still getting 404, check:
- Deployments tab → Click on deployment → View build logs
- Look for any errors during build
- Ensure `dist/index.html` is being created

The issue might be that Vercel is looking in the wrong directory for your frontend files.