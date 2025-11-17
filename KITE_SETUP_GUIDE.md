# 🚀 Complete Kite API Integration Setup Guide

## Overview

This guide will help you set up the complete Stock Trading Dashboard with Zerodha Kite API integration.

## Architecture

```
Frontend (Browser)  ←→  Backend Server  ←→  Zerodha Kite API
   (HTML/JS)            (Node.js/Express)      (OAuth + REST)
```

## Prerequisites

- Node.js 16+ installed
- Zerodha trading account
- Kite Connect API subscription (₹2000/month)
- Supabase account (free tier works)

---

## Part 1: Get Kite API Credentials

### Step 1: Register for Kite Connect

1. Go to https://kite.trade/
2. Click "Sign up" or "Login"
3. Complete the registration process
4. Subscribe to Kite Connect API (₹2000/month)

### Step 2: Create an App

1. Go to https://developers.kite.trade/apps
2. Click "Create new app"
3. Fill in details:
   - **App name**: Stock Trading Dashboard
   - **Redirect URL**: `http://localhost:8000` (for development)
   - **Postback URL**: Leave empty
4. Click "Create"

### Step 3: Get Credentials

After creating the app, you'll see:
- **API Key**: `xxxxxxxxxxxxxx` (public, safe to use)
- **API Secret**: `yyyyyyyyyyyy` (private, NEVER expose)

**Save these securely!**

---

## Part 2: Setup Backend Server

### Step 1: Install Dependencies

```bash
cd stock-trading-dashboard/backend
npm install
```

### Step 2: Configure Environment

Create `.env` file:

```bash
cp .env.example .env
```

Edit `.env`:

```env
KITE_API_KEY=your_actual_api_key_here
KITE_API_SECRET=your_actual_api_secret_here
PORT=3000
FRONTEND_URL=http://localhost:8000
ENCRYPTION_KEY=generate_32_char_random_string
```

**Generate encryption key:**
```bash
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

### Step 3: Start Backend Server

```bash
npm start
```

You should see:
```
🚀 Backend server running on http://localhost:3000
📊 Kite API Key: Configured
🔐 API Secret: Configured
```

**Keep this terminal running!**

---

## Part 3: Setup Supabase

### Step 1: Create Supabase Project

1. Go to https://supabase.com
2. Create new project
3. Wait for setup to complete

### Step 2: Run SQL Schema

Go to SQL Editor and run:

```sql
-- Create trades table
CREATE TABLE trades (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    kite_profile_id TEXT,
    symbol TEXT NOT NULL,
    exchange TEXT NOT NULL,
    type TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    brokerage DECIMAL(10,2) DEFAULT 0,
    taxes DECIMAL(10,2) DEFAULT 0,
    net_amount DECIMAL(12,2) NOT NULL,
    trade_date DATE NOT NULL,
    trade_time TIME,
    order_id TEXT,
    trade_id TEXT,
    notes TEXT,
    source TEXT DEFAULT 'MANUAL',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create positions table
CREATE TABLE positions (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    symbol TEXT NOT NULL,
    exchange TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    average_buy_price DECIMAL(10,2) NOT NULL,
    current_price DECIMAL(10,2),
    invested_value DECIMAL(12,2) NOT NULL,
    current_value DECIMAL(12,2),
    unrealized_pl DECIMAL(12,2),
    unrealized_pl_percent DECIMAL(5,2),
    last_updated TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, symbol, exchange)
);

-- Create kite_profiles table
CREATE TABLE kite_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    profile_name TEXT NOT NULL,
    kite_user_id TEXT NOT NULL,
    access_token TEXT,
    api_key TEXT,
    api_secret TEXT,
    is_active BOOLEAN DEFAULT true,
    last_sync_time TIMESTAMP,
    sync_status TEXT DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE kite_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Users can manage own trades" ON trades FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own positions" ON positions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own profiles" ON kite_profiles FOR ALL USING (auth.uid() = user_id);
```

### Step 3: Get Supabase Credentials

1. Go to Project Settings → API
2. Copy:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...`

### Step 4: Update Frontend Config

Edit `stock-trading-dashboard/auth.js`:

```javascript
this.supabaseUrl = 'YOUR_SUPABASE_URL';
this.supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
```

Edit `stock-trading-dashboard/cloud-db.js`:

```javascript
this.supabaseUrl = 'YOUR_SUPABASE_URL';
this.supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
```

---

## Part 4: Run the Application

### Step 1: Start Frontend

```bash
cd stock-trading-dashboard
python -m http.server 8000
```

Or use any static server.

### Step 2: Open in Browser

Go to: `http://localhost:8000`

### Step 3: Create Account

1. Click "Sign Up"
2. Enter details
3. Choose role (Admin for multi-profile)
4. Sign up

### Step 4: Connect Kite

1. Go to Settings
2. Click "Connect Kite"
3. Login to Zerodha
4. Authorize the app
5. You'll be redirected back

**Success!** You're now connected to Kite.

---

## Part 5: Using the App

### Import Trades from Kite

1. Click "Sync" button in header
2. Trades will be imported automatically
3. Portfolio will be calculated

### Add Manual Trades

1. Go to "Trades" view
2. Click "+ Add Trade"
3. Fill in details
4. Submit

### View Portfolio

1. Go to "Portfolio" view
2. See all positions with P&L
3. Click "Refresh Prices" for latest prices

### View Dashboard

- See portfolio summary
- Recent trades
- Top performers

---

## Part 6: Deploy to Production

### Backend Deployment (Heroku)

```bash
cd backend

# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set KITE_API_KEY=your_key
heroku config:set KITE_API_SECRET=your_secret
heroku config:set ENCRYPTION_KEY=your_key
heroku config:set FRONTEND_URL=https://your-frontend-url.com

# Deploy
git init
git add .
git commit -m "Initial commit"
heroku git:remote -a your-app-name
git push heroku main
```

### Frontend Deployment (GitHub Pages)

```bash
cd stock-trading-dashboard

# Update backend URL in kite-client.js
# Change: this.backendUrl = 'https://your-backend.herokuapp.com';

git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/username/repo.git
git push -u origin main

# Enable GitHub Pages in repo settings
```

### Update Kite Redirect URL

1. Go to https://developers.kite.trade/apps
2. Edit your app
3. Update Redirect URL to: `https://your-frontend-url.com`
4. Save

---

## Troubleshooting

### Backend won't start

**Error: KITE_API_KEY not configured**
- Check `.env` file exists
- Verify credentials are correct

### Can't connect to Kite

**Error: Invalid redirect URL**
- Update redirect URL in Kite dashboard
- Must match exactly (including http/https)

**Error: Token exchange failed**
- Check API Secret is correct
- Verify backend is running
- Check backend logs

### Trades not syncing

**Error: 401 Unauthorized**
- Reconnect to Kite (token expired)
- Tokens expire daily

**Error: CORS**
- Update `FRONTEND_URL` in backend `.env`
- Restart backend server

### Database errors

**Error: relation does not exist**
- Run SQL schema in Supabase
- Check table names match

---

## Security Checklist

- [ ] Never commit `.env` file
- [ ] Use HTTPS in production
- [ ] Keep API Secret secure
- [ ] Use strong encryption key
- [ ] Enable RLS in Supabase
- [ ] Set correct CORS origin
- [ ] Use environment variables
- [ ] Regular security updates

---

## Cost Breakdown

- **Kite Connect API**: ₹2000/month
- **Supabase**: Free (up to 500MB)
- **Heroku**: Free tier or $7/month
- **GitHub Pages**: Free

**Total**: ₹2000-2500/month

---

## Support

- **Kite API Docs**: https://kite.trade/docs/connect/v3/
- **Supabase Docs**: https://supabase.com/docs
- **Issues**: Open GitHub issue

---

## Next Steps

1. ✅ Complete setup
2. ✅ Connect Kite
3. ✅ Import trades
4. 📊 Add analytics charts
5. 🏢 Setup multi-profile (admin)
6. 📱 Test on Android
7. 🚀 Deploy to production

**You're all set! Happy trading! 📈**
