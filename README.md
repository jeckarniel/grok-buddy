# Grok Buddy — AI Coding Assistant

Frontend-only React app. Deploy to Vercel for free.

## Setup

1. Copy `.env.example` to `.env.local` and fill in your keys:
   - `VITE_SUPABASE_URL` — from Supabase project settings
   - `VITE_SUPABASE_ANON_KEY` — from Supabase API keys (publishable key)
   - `VITE_GROK_API_KEY` — your Grok API key

2. Install and run:
   ```
   npm install
   npm run dev
   ```

## Deploy to Vercel
1. Push to GitHub
2. Go to vercel.com → New Project → import repo
3. Add environment variables
4. Deploy!
