# 📊 Stock Trading Dashboard - Without Kite API

Use the full-featured Stock Trading Dashboard **completely FREE** without Kite API subscription!

---

## ✨ What You Get (100% Free)

- ✅ Manual trade entry (buy/sell)
- ✅ Portfolio tracking with P&L calculations
- ✅ Trade history with filters
- ✅ Dashboard with statistics
- ✅ Real-time portfolio calculations
- ✅ Export/Import data
- ✅ Cloud backup (Supabase)
- ✅ Works on Windows & Android
- ✅ Offline support
- ✅ Multi-user support

**What you DON'T need:**
- ❌ Kite API subscription (₹2000/month)
- ❌ Backend server (no Heroku costs)
- ❌ Complex OAuth setup

---

## 🚀 Quick Setup (5 Minutes)

### Step 1: Setup Supabase (Free)

1. Go to https://supabase.com
2. Create account (free)
3. Create new project
4. Go to SQL Editor
5. Run this SQL:

```sql
-- Create trades table
CREATE TABLE trades (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
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

-- Enable Row Level Security
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Users can manage own trades" ON trades FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own positions" ON positions FOR ALL USING (auth.uid() = user_id);
```

6. Go to Settings → API
7. Copy:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...`

### Step 2: Configure Frontend

Edit `stock-trading-dashboard/auth.js`:

```javascript
// Line 4-5, replace with your Supabase credentials:
this.supabaseUrl = 'YOUR_SUPABASE_URL_HERE';
this.supabaseKey = 'YOUR_SUPABASE_ANON_KEY_HERE';
```

Edit `stock-trading-dashboard/cloud-db.js`:

```javascript
// Line 6-7, replace with your Supabase credentials:
this.supabaseUrl = 'YOUR_SUPABASE_URL_HERE';
this.supabaseKey = 'YOUR_SUPABASE_ANON_KEY_HERE';
```

### Step 3: Deploy to GitHub Pages (Free)

```bash
cd stock-trading-dashboard

# Initialize git
git init
git add .
git commit -m "Stock Trading Dashboard"

# Create repo on GitHub, then:
git remote add origin https://github.com/yourusername/stock-trading-dashboard.git
git push -u origin main
```

Enable GitHub Pages:
1. Go to repo Settings → Pages
2. Source: `main` branch, `/ (root)` folder
3. Save

**Done!** Your app is live at:
`https://yourusername.github.io/stock-trading-dashboard/`

---

## 📱 How to Use

### 1. Create Account

1. Open your app URL
2. Click "Sign Up"
3. Enter name, email, password
4. Choose role: "Regular User"
5. Sign up

### 2. Add Your First Trade

1. Go to "Trades" view
2. Click "+ Add Trade"
3. Fill in:
   - **Symbol**: RELIANCE (stock name)
   - **Exchange**: NSE or BSE
   - **Type**: BUY or SELL
   - **Quantity**: Number of shares
   - **Price**: Price per share
   - **Brokerage**: Your broker charges
   - **Taxes**: STT, GST, etc.
   - **Date**: Trade date
   - **Notes**: Optional notes
4. Click "Add Trade"

**Example:**
```
Symbol: RELIANCE
Exchange: NSE
Type: BUY
Quantity: 10
Price: 2500
Brokerage: 20
Taxes: 50
Date: 2025-01-15
Notes: Long term investment
```

### 3. View Portfolio

1. Go to "Portfolio" view
2. See all your holdings
3. View P&L for each stock
4. Total portfolio value

### 4. Track Performance

1. Go to "Dashboard"
2. See:
   - Total portfolio value
   - Total P&L
   - Number of trades
   - Recent activity

### 5. Export Data

1. Go to "Settings"
2. Click "Export Data"
3. Save JSON file as backup

---

## 💡 Tips for Manual Entry

### Recording Trades from Broker

**From Zerodha/Upstox/etc:**

1. Download trade book (CSV/Excel)
2. For each trade, add manually:
   - Copy symbol, quantity, price
   - Add brokerage from contract note
   - Add date from trade book

### Calculating Charges

**Typical charges:**
- Brokerage: ₹20 per order (or 0.03%)
- STT: 0.1% on sell
- Transaction charges: 0.00325%
- GST: 18% on brokerage
- Stamp duty: 0.015% on buy

**Quick estimate:**
- Buy: ~0.05% of trade value
- Sell: ~0.15% of trade value

### Organizing Trades

**Best practices:**
1. Add trades daily
2. Use notes for strategy
3. Export weekly backup
4. Review monthly

---

## 🎯 Features You Can Use

### ✅ Available Features

1. **Manual Trade Entry**
   - Buy and sell trades
   - Multiple stocks
   - Historical trades

2. **Portfolio Tracking**
   - Current holdings
   - Average buy price
   - Invested amount
   - P&L calculation

3. **Trade History**
   - All trades listed
   - Filter by symbol
   - Filter by type (buy/sell)
   - Filter by date range
   - Search functionality

4. **Dashboard**
   - Portfolio summary
   - Total P&L
   - Recent trades
   - Top performers

5. **Data Management**
   - Export to JSON
   - Import from backup
   - Cloud sync
   - Offline support

6. **Multi-Device**
   - Works on Windows
   - Works on Android
   - Install as PWA
   - Data syncs across devices

### ❌ Not Available (Requires Kite API)

- Auto-import trades from Zerodha
- Real-time market prices
- Live portfolio updates
- Automatic sync

**But you can:**
- Manually update prices
- Calculate P&L based on your entry
- Track everything yourself

---

## 📊 Updating Current Prices

Since you don't have live prices, update manually:

1. Check current price on:
   - Google Finance
   - Yahoo Finance
   - NSE/BSE website
   - Your broker app

2. In your mind, calculate:
   - Current Value = Quantity × Current Price
   - P&L = Current Value - Invested Value

**Note:** The app calculates P&L based on your trades. For current market value, you'll need to check prices separately.

---

## 💰 Cost Comparison

### With Kite API
- Kite API: ₹2,000/month
- Backend hosting: ₹400/month
- **Total: ₹2,400/month**

### Without Kite API (This Setup)
- Supabase: FREE
- GitHub Pages: FREE
- **Total: ₹0/month** 🎉

**Savings: ₹28,800/year!**

---

## 🚀 Deploy Without Backend

You don't need the backend server at all!

**Skip these files:**
- `backend/` folder (not needed)
- `kite-client.js` (optional)

**Just deploy:**
- Frontend to GitHub Pages
- Configure Supabase
- Start using!

---

## 📱 Install on Android

1. Open app in Chrome on Android
2. Tap menu (⋮)
3. Tap "Add to Home screen"
4. App installs like native app
5. Works offline!

---

## 🔄 Workflow Example

**Daily routine:**

1. **Morning**: Check your broker app for trades
2. **Add trades**: Open dashboard, add any new trades
3. **Review**: Check portfolio, see P&L
4. **Evening**: Export backup

**Weekly:**
- Review performance
- Update strategy notes
- Check top performers

**Monthly:**
- Calculate actual P&L
- Compare with broker statement
- Plan next trades

---

## 🎓 Tutorial: First Trade

Let's add your first trade step-by-step:

**Scenario:** You bought 5 shares of TCS at ₹3500

1. Open app → Login
2. Click "Trades" in navigation
3. Click "+ Add Trade" button
4. Fill form:
   ```
   Symbol: TCS
   Exchange: NSE
   Type: BUY
   Quantity: 5
   Price: 3500
   Brokerage: 20
   Taxes: 30
   Date: Today's date
   Notes: Tech sector investment
   ```
5. Click "Add Trade"
6. Go to "Portfolio" → See TCS position
7. Go to "Dashboard" → See stats updated

**Congratulations!** 🎉 You've tracked your first trade!

---

## ❓ FAQ

**Q: Can I track multiple brokers?**
A: Yes! Add trades from any broker manually.

**Q: Can I track mutual funds?**
A: Yes! Add them as trades with appropriate symbols.

**Q: Can I share with family?**
A: Yes! Each person creates their own account.

**Q: Is my data safe?**
A: Yes! Stored in Supabase with encryption and RLS.

**Q: Can I use offline?**
A: Yes! PWA works offline, syncs when online.

**Q: Can I export to Excel?**
A: Export to JSON, then convert to Excel if needed.

---

## 🎉 You're Ready!

You now have a **completely free** stock trading dashboard that:
- Tracks all your trades
- Calculates portfolio and P&L
- Works on any device
- Backs up to cloud
- Costs ₹0/month

**No Kite API needed!**

Start tracking your portfolio today! 📈💰

---

## 🔗 Quick Links

- **Supabase**: https://supabase.com
- **GitHub Pages**: https://pages.github.com
- **Your App**: `https://yourusername.github.io/stock-trading-dashboard/`

**Happy Trading! 🚀**
