# Deployment Guide

## ✅ Issue Fixed!

The GitHub push protection error has been resolved. The API key is now stored in environment variables instead of being hardcoded.

## 📦 What Was Changed

1. ✅ Removed hardcoded API key from source files
2. ✅ Added `.env` to `.gitignore`
3. ✅ Created `.env.example` for reference
4. ✅ Updated code to use `import.meta.env.VITE_GROQ_API_KEY`
5. ✅ Added `vercel.json` configuration
6. ✅ Force pushed to remove exposed secret from git history

## 🚀 Deploy to Vercel

### Option 1: Via Vercel Dashboard (Recommended)

1. **Go to Vercel**
   - Visit [vercel.com](https://vercel.com/)
   - Sign in with your GitHub account

2. **Import Project**
   - Click "Add New Project"
   - Select your `pocketkash_` repository from the list
   - Click "Import"

3. **Configure Project**
   - Vercel will auto-detect Vite configuration
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **Add Environment Variable** ⚠️ **IMPORTANT**
   - Before deploying, click "Environment Variables"
   - Add:
     ```
     Key: VITE_GROQ_API_KEY
     Value: <your-groq-api-key-here>
     ```
   - Select all environments (Production, Preview, Development)
   - Click "Add"

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes for build to complete
   - Your app will be live! 🎉

### Option 2: Via Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy (first time)
vercel

# Follow prompts and set up the project

# Add environment variable
vercel env add VITE_GROQ_API_KEY

# Paste your API key when prompted

# Deploy to production
vercel --prod
```

## 🔒 Security Notes

- ✅ API key is now in environment variables
- ✅ `.env` file is in `.gitignore` and won't be committed
- ✅ Previous commits with exposed key have been overwritten
- ⚠️ Consider regenerating your Groq API key for extra security:
  - Go to [Groq Console](https://console.groq.com/)
  - Regenerate API key
  - Update in `.env` locally
  - Update in Vercel environment variables

## 📝 Local Development

After cloning the repository:

```bash
# Copy example env file
cp .env.example .env

# Edit .env and add your API key
# VITE_GROQ_API_KEY=your_key_here

# Install dependencies
npm install

# Start dev server
npm run dev
```

## 🔗 After Deployment

Your app will be available at:
- Production: `https://pocketkash.vercel.app` (or custom domain)
- Preview: Automatic preview URLs for each commit
- Development: `http://localhost:5173`

## 📞 Need Help?

- Vercel Docs: https://vercel.com/docs
- Groq Cloud: https://console.groq.com/
- GitHub Issues: Create an issue in your repository

---

**Status**: ✅ Ready to deploy!
