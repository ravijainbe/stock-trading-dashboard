# 🚀 Quick Start Guide

Get your Stock Trading Dashboard running in 10 minutes!

## Prerequisites

- Node.js 16+ installed
- Zerodha Kite API credentials
- Supabase account

## Step 1: Setup Backend (2 minutes)

```bash
cd stock-trading-dashboard/backend
npm install
cp .env.example .env
```

Edit `.env` and add your credentials:
```env
KITE_API_KEY=your_kite_api_key
KITE_API_SECRET=your_kite_api_secret
ENCRYPTION_KEY=$(node -e "console.log(require('crypto').randomBytes(16).toString('hex'))")
```

Start backend:
```bash
npm start
```

## Step 2: Setup Supabase (3 minutes)

1. Create project at supabase.com
2. Run SQL from `README.md` in SQL Editor
3. Get URL and anon key from Settings → API

## Step 3: Configure Frontend (2 minutes)

Edit `auth.js` and `cloud-db.js`:
```javascript
this.supabaseUrl = 'YOUR_SUPABASE_URL';
this.supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
```

## Step 4: Run Frontend (1 minute)

```bash
cd stock-trading-dashboard
python -m http.server 8000
```

## Step 5: Use the App (2 minutes)

1. Open http://localhost:8000
2. Sign up
3. Go to Settings → Connect Kite
4. Authorize
5. Click Sync!

**Done! 🎉**

## What's Next?

- Import your trades
- View portfolio
- Track P&L
- Deploy to production

See `KITE_SETUP_GUIDE.md` for detailed instructions.
