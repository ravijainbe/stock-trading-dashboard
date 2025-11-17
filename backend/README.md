# Stock Trading Dashboard - Backend Server

Secure Node.js backend for Zerodha Kite API integration.

## Features

- 🔐 Secure OAuth token exchange
- 🔒 Encrypted token storage
- 📊 Kite API proxy endpoints
- 🚀 RESTful API
- ⚡ Fast and lightweight

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Create a `.env` file:

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

```env
# Get these from https://kite.trade/
KITE_API_KEY=your_kite_api_key
KITE_API_SECRET=your_kite_api_secret

# Server config
PORT=3000
FRONTEND_URL=http://localhost:8000

# Generate a random 32-character key
ENCRYPTION_KEY=your_32_character_random_string
```

**To generate encryption key:**
```bash
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

### 3. Start the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Server will run on `http://localhost:3000`

## API Endpoints

### Authentication

#### Get Login URL
```
GET /api/kite/login-url
Response: { success: true, loginUrl: "https://kite.zerodha.com/..." }
```

#### Exchange Token
```
POST /api/kite/token
Body: { requestToken: "...", userId: "..." }
Response: { success: true, data: { userId, userName, email } }
```

#### Check Status
```
GET /api/kite/status?userId=...
Response: { success: true, connected: true, data: {...} }
```

#### Disconnect
```
POST /api/kite/disconnect
Body: { userId: "..." }
Response: { success: true, message: "Disconnected" }
```

### Data Endpoints

#### Get Profile
```
GET /api/kite/profile?userId=...
Response: { success: true, data: {...} }
```

#### Get Holdings
```
GET /api/kite/holdings?userId=...
Response: { success: true, data: [...] }
```

#### Get Positions
```
GET /api/kite/positions?userId=...
Response: { success: true, data: {...} }
```

#### Get Orders
```
GET /api/kite/orders?userId=...
Response: { success: true, data: [...] }
```

#### Get Trades
```
GET /api/kite/trades?userId=...
Response: { success: true, data: [...] }
```

#### Get Quotes
```
POST /api/kite/quote
Body: { userId: "...", symbols: ["NSE:RELIANCE", "NSE:TCS"] }
Response: { success: true, data: {...} }
```

#### Get LTP (Last Traded Price)
```
POST /api/kite/ltp
Body: { userId: "...", symbols: ["NSE:RELIANCE"] }
Response: { success: true, data: {...} }
```

## Security Features

- ✅ Access tokens encrypted at rest
- ✅ API Secret never exposed to frontend
- ✅ CORS protection
- ✅ Environment-based configuration
- ✅ Secure token exchange

## Deployment

### Option 1: Heroku

```bash
# Install Heroku CLI
heroku create your-app-name
heroku config:set KITE_API_KEY=your_key
heroku config:set KITE_API_SECRET=your_secret
heroku config:set ENCRYPTION_KEY=your_key
heroku config:set FRONTEND_URL=https://your-frontend.com
git push heroku main
```

### Option 2: Railway

1. Go to railway.app
2. Create new project from GitHub
3. Add environment variables
4. Deploy

### Option 3: DigitalOcean App Platform

1. Create new app
2. Connect GitHub repo
3. Set environment variables
4. Deploy

### Option 4: VPS (Ubuntu)

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone and setup
git clone your-repo
cd backend
npm install
npm install -g pm2

# Create .env file
nano .env

# Start with PM2
pm2 start server.js --name stock-backend
pm2 save
pm2 startup
```

## Testing

Test the server:

```bash
# Health check
curl http://localhost:3000/health

# Get login URL
curl http://localhost:3000/api/kite/login-url
```

## Troubleshooting

**Error: KITE_API_KEY not configured**
- Make sure `.env` file exists
- Check that variables are set correctly

**Error: Invalid API credentials**
- Verify your Kite API key and secret
- Check if they're active on kite.trade

**CORS errors**
- Update `FRONTEND_URL` in `.env`
- Make sure frontend URL matches exactly

## Production Checklist

- [ ] Set strong ENCRYPTION_KEY
- [ ] Use HTTPS for frontend
- [ ] Set correct FRONTEND_URL
- [ ] Use database for token storage (not in-memory)
- [ ] Add rate limiting
- [ ] Add logging
- [ ] Set up monitoring
- [ ] Configure firewall
- [ ] Use environment variables
- [ ] Enable HTTPS on backend

## Notes

- Access tokens expire daily - users need to re-authenticate
- In-memory storage is for development only
- For production, use Redis or database for token storage
- Keep API Secret secure - never commit to git

## Support

For Kite API documentation: https://kite.trade/docs/connect/v3/
