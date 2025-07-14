# 🚀 BlueFox Vercel Deployment Guide

## Prerequisites
- Vercel account (free tier works)
- Git repository (GitHub, GitLab, or Bitbucket)
- ConvertKit API key

## Quick Deploy

### Option 1: Deploy with Vercel CLI

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy from the frontend directory:
```bash
cd frontend
vercel
```

4. Follow the prompts:
   - Set up and deploy? **Yes**
   - Which scope? **Your account**
   - Link to existing project? **No** (first time)
   - Project name? **bluefox** (or your choice)
   - Directory? **./** (current directory)
   - Override settings? **No**

### Option 2: Deploy via GitHub

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Select the `frontend` folder as root directory
6. Deploy!

## Environment Variables

After deployment, add these environment variables in Vercel Dashboard:

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add:
   - `CONVERTKIT_API_KEY` - Your ConvertKit API key

## Post-Deployment

1. **Custom Domain** (optional):
   - Go to Settings → Domains
   - Add your domain
   - Update DNS records as instructed

2. **Test Your Deployment**:
   - Visit your Vercel URL
   - Login with: `admin@bluefox.com` / `bluefox123`
   - Test survey creation and ConvertKit integration

## Local Testing with Vercel

Test the Vercel functions locally:

```bash
vercel dev
```

This will run both the Vite dev server and Vercel Functions locally.

## Troubleshooting

### API Routes Not Working
- Check that all files in `/api` have `.ts` extension
- Verify environment variables are set
- Check Vercel function logs in dashboard

### CORS Issues
- The `vercel.json` includes CORS headers
- For production, update allowed origins

### Build Failures
- Check TypeScript errors: `npm run build`
- Verify all dependencies are in `package.json`
- Check Vercel build logs

## Production Checklist

- [ ] Change default admin password
- [ ] Set up proper authentication (JWT)
- [ ] Configure production CORS origins
- [ ] Enable Vercel Analytics (optional)
- [ ] Set up monitoring/alerts
- [ ] Regular backups of localStorage data

## Notes

- Frontend runs on Vercel's edge network
- API functions are serverless (auto-scaling)
- Free tier includes 100GB bandwidth/month
- SSL/HTTPS included automatically