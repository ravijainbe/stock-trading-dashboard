const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
require('dotenv').config();

const KiteConnect = require('kiteconnect').KiteConnect;

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:8000',
    credentials: true
}));
app.use(express.json());

// In-memory storage for access tokens (use database in production)
const userTokens = new Map();

// Initialize Kite Connect
const kite = new KiteConnect({
    api_key: process.env.KITE_API_KEY
});

// Encryption utilities
function encrypt(text) {
    const algorithm = 'aes-256-cbc';
    const key = Buffer.from(process.env.ENCRYPTION_KEY, 'utf8');
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
}

function decrypt(text) {
    const algorithm = 'aes-256-cbc';
    const key = Buffer.from(process.env.ENCRYPTION_KEY, 'utf8');
    const parts = text.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = parts[1];
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

// Routes

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

// Get Kite login URL
app.get('/api/kite/login-url', (req, res) => {
    try {
        const loginUrl = kite.getLoginURL();
        res.json({ success: true, loginUrl });
    } catch (error) {
        console.error('Error generating login URL:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Exchange request token for access token
app.post('/api/kite/token', async (req, res) => {
    try {
        const { requestToken, userId } = req.body;

        if (!requestToken) {
            return res.status(400).json({ success: false, error: 'Request token is required' });
        }

        // Generate session
        const session = await kite.generateSession(requestToken, process.env.KITE_API_SECRET);
        
        // Encrypt and store access token
        const encryptedToken = encrypt(session.access_token);
        userTokens.set(userId, {
            accessToken: encryptedToken,
            publicToken: session.public_token,
            userId: session.user_id,
            userName: session.user_name,
            email: session.email,
            createdAt: new Date()
        });

        res.json({
            success: true,
            data: {
                userId: session.user_id,
                userName: session.user_name,
                email: session.email
            }
        });
    } catch (error) {
        console.error('Error exchanging token:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get user profile
app.get('/api/kite/profile', async (req, res) => {
    try {
        const { userId } = req.query;
        const tokenData = userTokens.get(userId);

        if (!tokenData) {
            return res.status(401).json({ success: false, error: 'Not authenticated' });
        }

        const accessToken = decrypt(tokenData.accessToken);
        kite.setAccessToken(accessToken);

        const profile = await kite.getProfile();
        res.json({ success: true, data: profile });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get holdings
app.get('/api/kite/holdings', async (req, res) => {
    try {
        const { userId } = req.query;
        const tokenData = userTokens.get(userId);

        if (!tokenData) {
            return res.status(401).json({ success: false, error: 'Not authenticated' });
        }

        const accessToken = decrypt(tokenData.accessToken);
        kite.setAccessToken(accessToken);

        const holdings = await kite.getHoldings();
        res.json({ success: true, data: holdings });
    } catch (error) {
        console.error('Error fetching holdings:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get positions
app.get('/api/kite/positions', async (req, res) => {
    try {
        const { userId } = req.query;
        const tokenData = userTokens.get(userId);

        if (!tokenData) {
            return res.status(401).json({ success: false, error: 'Not authenticated' });
        }

        const accessToken = decrypt(tokenData.accessToken);
        kite.setAccessToken(accessToken);

        const positions = await kite.getPositions();
        res.json({ success: true, data: positions });
    } catch (error) {
        console.error('Error fetching positions:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get orders
app.get('/api/kite/orders', async (req, res) => {
    try {
        const { userId } = req.query;
        const tokenData = userTokens.get(userId);

        if (!tokenData) {
            return res.status(401).json({ success: false, error: 'Not authenticated' });
        }

        const accessToken = decrypt(tokenData.accessToken);
        kite.setAccessToken(accessToken);

        const orders = await kite.getOrders();
        res.json({ success: true, data: orders });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get trades
app.get('/api/kite/trades', async (req, res) => {
    try {
        const { userId } = req.query;
        const tokenData = userTokens.get(userId);

        if (!tokenData) {
            return res.status(401).json({ success: false, error: 'Not authenticated' });
        }

        const accessToken = decrypt(tokenData.accessToken);
        kite.setAccessToken(accessToken);

        const trades = await kite.getTrades();
        res.json({ success: true, data: trades });
    } catch (error) {
        console.error('Error fetching trades:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get quotes for symbols
app.post('/api/kite/quote', async (req, res) => {
    try {
        const { userId, symbols } = req.body;
        const tokenData = userTokens.get(userId);

        if (!tokenData) {
            return res.status(401).json({ success: false, error: 'Not authenticated' });
        }

        const accessToken = decrypt(tokenData.accessToken);
        kite.setAccessToken(accessToken);

        const quotes = await kite.getQuote(symbols);
        res.json({ success: true, data: quotes });
    } catch (error) {
        console.error('Error fetching quotes:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get LTP (Last Traded Price) for symbols
app.post('/api/kite/ltp', async (req, res) => {
    try {
        const { userId, symbols } = req.body;
        const tokenData = userTokens.get(userId);

        if (!tokenData) {
            return res.status(401).json({ success: false, error: 'Not authenticated' });
        }

        const accessToken = decrypt(tokenData.accessToken);
        kite.setAccessToken(accessToken);

        const ltp = await kite.getLTP(symbols);
        res.json({ success: true, data: ltp });
    } catch (error) {
        console.error('Error fetching LTP:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Disconnect Kite
app.post('/api/kite/disconnect', (req, res) => {
    try {
        const { userId } = req.body;
        userTokens.delete(userId);
        res.json({ success: true, message: 'Disconnected successfully' });
    } catch (error) {
        console.error('Error disconnecting:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Check connection status
app.get('/api/kite/status', (req, res) => {
    try {
        const { userId } = req.query;
        const isConnected = userTokens.has(userId);
        const tokenData = isConnected ? userTokens.get(userId) : null;

        res.json({
            success: true,
            connected: isConnected,
            data: isConnected ? {
                userId: tokenData.userId,
                userName: tokenData.userName,
                email: tokenData.email
            } : null
        });
    } catch (error) {
        console.error('Error checking status:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Backend server running on http://localhost:${PORT}`);
    console.log(`📊 Kite API Key: ${process.env.KITE_API_KEY ? 'Configured' : 'NOT CONFIGURED'}`);
    console.log(`🔐 API Secret: ${process.env.KITE_API_SECRET ? 'Configured' : 'NOT CONFIGURED'}`);
});
