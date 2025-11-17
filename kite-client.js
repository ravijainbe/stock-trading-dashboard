// Zerodha Kite API Client - Frontend
class KiteClient {
    constructor(userId) {
        this.userId = userId;
        this.backendUrl = 'http://localhost:3000'; // Change to your backend URL in production
        this.isConnected = false;
    }

    async checkStatus() {
        try {
            const response = await fetch(`${this.backendUrl}/api/kite/status?userId=${this.userId}`);
            const data = await response.json();
            this.isConnected = data.connected;
            return data;
        } catch (error) {
            console.error('Error checking Kite status:', error);
            return { success: false, connected: false };
        }
    }

    async initiateLogin() {
        try {
            const response = await fetch(`${this.backendUrl}/api/kite/login-url`);
            const data = await response.json();
            
            if (data.success) {
                // Store userId in session for callback
                sessionStorage.setItem('kite_user_id', this.userId);
                // Redirect to Kite login
                window.location.href = data.loginUrl;
            } else {
                throw new Error(data.error || 'Failed to get login URL');
            }
        } catch (error) {
            console.error('Error initiating Kite login:', error);
            alert('Failed to connect to Kite: ' + error.message);
        }
    }

    async handleCallback(requestToken) {
        try {
            const response = await fetch(`${this.backendUrl}/api/kite/token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    requestToken: requestToken,
                    userId: this.userId
                })
            });

            const data = await response.json();
            
            if (data.success) {
                this.isConnected = true;
                return data;
            } else {
                throw new Error(data.error || 'Token exchange failed');
            }
        } catch (error) {
            console.error('Error exchanging token:', error);
            throw error;
        }
    }

    async disconnect() {
        try {
            const response = await fetch(`${this.backendUrl}/api/kite/disconnect`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: this.userId })
            });

            const data = await response.json();
            this.isConnected = false;
            return data;
        } catch (error) {
            console.error('Error disconnecting:', error);
            throw error;
        }
    }

    async getProfile() {
        try {
            const response = await fetch(`${this.backendUrl}/api/kite/profile?userId=${this.userId}`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching profile:', error);
            throw error;
        }
    }

    async getHoldings() {
        try {
            const response = await fetch(`${this.backendUrl}/api/kite/holdings?userId=${this.userId}`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching holdings:', error);
            throw error;
        }
    }

    async getPositions() {
        try {
            const response = await fetch(`${this.backendUrl}/api/kite/positions?userId=${this.userId}`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching positions:', error);
            throw error;
        }
    }

    async getOrders() {
        try {
            const response = await fetch(`${this.backendUrl}/api/kite/orders?userId=${this.userId}`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching orders:', error);
            throw error;
        }
    }

    async getTrades() {
        try {
            const response = await fetch(`${this.backendUrl}/api/kite/trades?userId=${this.userId}`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching trades:', error);
            throw error;
        }
    }

    async getQuote(symbols) {
        try {
            const response = await fetch(`${this.backendUrl}/api/kite/quote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: this.userId,
                    symbols: symbols
                })
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching quotes:', error);
            throw error;
        }
    }

    async getLTP(symbols) {
        try {
            const response = await fetch(`${this.backendUrl}/api/kite/ltp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: this.userId,
                    symbols: symbols
                })
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching LTP:', error);
            throw error;
        }
    }

    async syncTrades() {
        try {
            const tradesData = await this.getTrades();
            if (tradesData.success) {
                return tradesData.data;
            }
            throw new Error('Failed to fetch trades');
        } catch (error) {
            console.error('Error syncing trades:', error);
            throw error;
        }
    }
}

// Global function for connect button
async function connectKite() {
    if (!window.stockApp || !window.stockApp.authManager) {
        alert('Please log in first');
        return;
    }

    const userId = window.stockApp.authManager.getUserId();
    const kiteClient = new KiteClient(userId);
    
    // Check if already connected
    const status = await kiteClient.checkStatus();
    if (status.connected) {
        if (confirm('Already connected to Kite. Disconnect?')) {
            await kiteClient.disconnect();
            alert('Disconnected from Kite');
            updateKiteStatus();
        }
    } else {
        // Initiate login
        await kiteClient.initiateLogin();
    }
}

// Handle Kite callback
window.addEventListener('load', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const requestToken = urlParams.get('request_token');
    const status = urlParams.get('status');

    if (requestToken && status === 'success') {
        const userId = sessionStorage.getItem('kite_user_id');
        if (userId) {
            const kiteClient = new KiteClient(userId);
            try {
                await kiteClient.handleCallback(requestToken);
                alert('Successfully connected to Kite!');
                // Clean URL
                window.history.replaceState({}, document.title, window.location.pathname);
                sessionStorage.removeItem('kite_user_id');
            } catch (error) {
                alert('Failed to connect: ' + error.message);
            }
        }
    }
});

// Update Kite status in settings
async function updateKiteStatus() {
    if (!window.stockApp) return;

    const userId = window.stockApp.authManager.getUserId();
    const kiteClient = new KiteClient(userId);
    const status = await kiteClient.checkStatus();

    const statusDiv = document.getElementById('kite-status');
    const connectBtn = document.getElementById('kite-connect-btn');

    if (status.connected) {
        statusDiv.innerHTML = `
            <div style="padding: 10px; background: #d4edda; color: #155724; border-radius: 6px; margin-bottom: 10px;">
                ✅ Connected as ${status.data.userName} (${status.data.email})
            </div>
        `;
        connectBtn.textContent = 'Disconnect Kite';
    } else {
        statusDiv.innerHTML = `
            <div style="padding: 10px; background: #f8d7da; color: #721c24; border-radius: 6px; margin-bottom: 10px;">
                ❌ Not connected to Kite
            </div>
        `;
        connectBtn.textContent = 'Connect Kite';
    }
}

window.KiteClient = KiteClient;
window.updateKiteStatus = updateKiteStatus;
