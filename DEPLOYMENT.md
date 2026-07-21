# Vercel Deployment Guide

This guide will help you deploy the CEFR English Evaluator to Vercel.

## Prerequisites

1. A [Vercel account](https://vercel.com/signup) (free)
2. [Vercel CLI](https://vercel.com/docs/cli) installed (optional, but recommended)
3. Your API credentials ready

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Easiest)

1. **Push your code to GitHub** (already done! ✅)

2. **Go to [Vercel](https://vercel.com)** and sign in

3. **Click "Add New Project"**

4. **Import your GitHub repository:**
   - Connect your GitHub account if not already connected
   - Select `AI-English-vocabulary-evaluator` repository
   - Click "Import"

5. **Configure the project:**
   - **Framework Preset:** Vite
   - **Root Directory:** `./` (leave as default)
   - **Build Command:** Leave default or set to `cd client && npm run build`
   - **Output Directory:** `client/dist`

6. **Add Environment Variables:**
   Click "Environment Variables" and add:
   ```
   ANTHROPIC_API_KEY=sk-2wcPNLAhVm6WxfcSQYjpXxPvymSwjU3qpSVz2d8clxZ9VYdp
   ANTHROPIC_BASE_URL=https://v98store.com
   ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
   ```

7. **Click "Deploy"** and wait for deployment to complete

8. **Your app will be live!** You'll get a URL like `https://your-app.vercel.app`

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Navigate to your project directory:**
   ```bash
   cd "D:\Work\Coding PJ\AI-English-vocabulary-evaluator"
   ```

4. **Deploy:**
   ```bash
   vercel
   ```

5. **Follow the prompts:**
   - Link to existing project or create new? → Create new
   - What's your project's name? → AI-English-vocabulary-evaluator
   - In which directory is your code located? → `./`

6. **Add environment variables:**
   ```bash
   vercel env add ANTHROPIC_API_KEY
   vercel env add ANTHROPIC_BASE_URL
   vercel env add ANTHROPIC_MODEL
   ```

7. **Deploy to production:**
   ```bash
   vercel --prod
   ```

## Important Notes

### Environment Variables
Make sure to add these environment variables in Vercel:
- `ANTHROPIC_API_KEY` - Your Claude API key
- `ANTHROPIC_BASE_URL` - Your custom API endpoint
- `ANTHROPIC_MODEL` - The model to use (claude-3-5-sonnet-20241022)

### API Routes
The backend API will be available at `/api/*` routes automatically.

### Frontend Configuration
If you need to update the API URL for the frontend, create a `.env` file in the `client` directory:
```
VITE_API_URL=https://your-app.vercel.app
```

But by default, it will use relative URLs which work automatically on Vercel.

## Troubleshooting

### Build Fails
- Check that all dependencies are in `package.json`
- Make sure the build command is correct
- Check the Vercel build logs for specific errors

### API Not Working
- Verify environment variables are set correctly
- Check the Function logs in Vercel dashboard
- Ensure your API endpoint supports the requests

### CORS Issues
The server already has CORS enabled, but if you encounter issues:
- Check that the API URL in the client matches your deployment URL
- Verify the backend is receiving requests in the Function logs

## Continuous Deployment

Once set up, Vercel will automatically:
- ✅ Deploy every push to `master` branch
- ✅ Create preview deployments for pull requests
- ✅ Run builds and tests automatically
- ✅ Provide deployment URLs for each version

## Custom Domain (Optional)

To add a custom domain:
1. Go to your project in Vercel dashboard
2. Click "Settings" → "Domains"
3. Add your domain and follow the DNS configuration steps

---

## Support

If you encounter issues:
- Check [Vercel Documentation](https://vercel.com/docs)
- Review deployment logs in Vercel dashboard
- Check the GitHub repository issues

🚀 Happy Deploying!
