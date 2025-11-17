# 📈 Stock Trading Dashboard

A comprehensive stock trading dashboard with Zerodha Kite API integration for tracking portfolio, P&L, and managing trades across multiple profiles.

## Features

- 🔐 **Secure Authentication** - User authentication with role-based access (Admin/User)
- 📊 **Portfolio Tracking** - Real-time portfolio value and P&L tracking
- 💼 **Trade Management** - Manual trade entry and automatic Kite import
- 📈 **Analytics** - Charts and performance metrics
- 🏢 **Multi-Profile Dashboard** - Consolidated view for admins (multiple Kite accounts)
- 👁️ **Watchlist** - Track stocks with price alerts
- 💾 **Cloud Sync** - Automatic backup to Supabase
- 📱 **PWA** - Install on Android as native app
- 🌐 **Cross-Platform** - Works on Windows desktop and Android mobile

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Local Storage**: IndexedDB
- **Cloud Storage**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth + Zerodha OAuth
- **API**: Zerodha Kite Connect API
- **Charts**: Chart.js
- **PWA**: Service Worker, Web App Manifest

## Setup Instructions

### 1. Supabase Setup

1. Create a Supabase project at https://supabase.com
2. Create the following tables:

```sql
-- Users table (handled by Supabase Auth)

-- Trades table
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

-- Positions table
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

-- Kite Profiles table
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

-- RLS Policies
CREATE POLICY "Users can view own trades" ON trades FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own trades" ON trades FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own trades" ON trades FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own trades" ON trades FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own positions" ON positions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own positions" ON positions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own positions" ON positions FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own kite profiles" ON kite_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own kite profiles" ON kite_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own kite profiles" ON kite_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own kite profiles" ON kite_profiles FOR DELETE USING (auth.uid() = user_id);
```

3. Get your Supabase URL and anon key from Project Settings → API
4. Update `auth.js` with your Supabase credentials

### 2. Zerodha Kite API Setup

1. Register for Kite Connect API at https://kite.trade/
2. Create an app and get your API Key and API Secret
3. Update `kite-client.js` with your API credentials
4. Configure redirect URL in Kite dashboard

### 3. Local Development

1. Clone the repository
2. Open `index.html` in a browser or use a local server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx http-server
   ```
3. Access at `http://localhost:8000`

### 4. Deployment

#### GitHub Pages
1. Push code to GitHub repository
2. Go to Settings → Pages
3. Select branch `main` and folder `/ (root)`
4. Your app will be live at `https://username.github.io/repo-name/`

## Usage

### First Time Setup

1. **Sign Up**: Create an account with email and password
2. **Choose Role**: Select "Admin" for multi-profile access or "User" for single profile
3. **Connect Kite**: Go to Settings → Connect Kite to link your Zerodha account
4. **Sync Data**: Click Sync button to import trades from Kite

### Adding Trades Manually

1. Go to Trades view
2. Click "+ Add Trade"
3. Fill in trade details (symbol, type, quantity, price, date)
4. Click "Add Trade"

### Viewing Portfolio

1. Go to Portfolio view
2. See current holdings with P&L
3. Click "Refresh Prices" to update market prices

### Multi-Profile Dashboard (Admin Only)

1. Go to Consolidated view
2. Click "Manage Profiles" to add multiple Kite accounts
3. View aggregated portfolio across all profiles

## PWA Installation (Android)

1. Open the app in Chrome on Android
2. Tap the menu (⋮) → "Add to Home screen"
3. The app will install like a native app
4. Launch from home screen

## Security

- All sensitive data is encrypted
- Kite tokens are stored securely
- Session timeout after 30 minutes
- HTTPS required for production

## Support

For issues or questions, please open an issue on GitHub.

## License

MIT License
