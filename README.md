# Grok Buddy - AI Coding Assistant

React app with a small Vercel API proxy for Grok requests.

## Setup

1. Copy `.env.example` to `.env.local` and fill in your keys:
   - `VITE_SUPABASE_URL` - from Supabase project settings
   - `VITE_SUPABASE_ANON_KEY` - from Supabase API keys (publishable key)
   - `GROK_API_KEY` - your xAI/Grok API key, set only on the server/Vercel

2. Install and run:
   ```sh
   npm install
   npm run dev
   ```

## Deploy to Vercel

1. Push to GitHub.
2. Go to vercel.com, create a new project, and import the repo.
3. Add the environment variables.
4. Deploy.
