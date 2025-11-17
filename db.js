// IndexedDB Database Manager for Stock Trading Dashboard
class StockDB {
    constructor() {
        this.dbName = 'StockTradingDB';
        this.version = 1;
        this.db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => {
                console.error('Database failed to open');
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                console.log('Database opened successfully');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Create Trades object store
                if (!db.objectStoreNames.contains('trades')) {
                    const tradeStore = db.createObjectStore('trades', { keyPath: 'id', autoIncrement: true });
                    tradeStore.createIndex('userId', 'userId', { unique: false });
                    tradeStore.createIndex('symbol', 'symbol', { unique: false });
                    tradeStore.createIndex('date', 'tradeDate', { unique: false });
                    tradeStore.createIndex('type', 'type', { unique: false });
                    tradeStore.createIndex('source', 'source', { unique: false });
                    tradeStore.createIndex('userSymbol', ['userId', 'symbol'], { unique: false });
                    tradeStore.createIndex('userDate', ['userId', 'tradeDate'], { unique: false });
                    console.log('Trades object store created');
                }

                // Create Positions object store
                if (!db.objectStoreNames.contains('positions')) {
                    const positionStore = db.createObjectStore('positions', { keyPath: 'id', autoIncrement: true });
                    positionStore.createIndex('userId', 'userId', { unique: false });
                    positionStore.createIndex('symbol', 'symbol', { unique: false });
                    positionStore.createIndex('userSymbol', ['userId', 'symbol'], { unique: true });
                    console.log('Positions object store created');
                }

                // Create Kite Profiles object store
                if (!db.objectStoreNames.contains('kiteProfiles')) {
                    const profileStore = db.createObjectStore('kiteProfiles', { keyPath: 'id', autoIncrement: true });
                    profileStore.createIndex('userId', 'userId', { unique: false });
                    profileStore.createIndex('kiteUserId', 'kiteUserId', { unique: false });
                    profileStore.createIndex('isActive', 'isActive', { unique: false });
                    console.log('Kite Profiles object store created');
                }

                // Create Users object store (for local user data)
                if (!db.objectStoreNames.contains('users')) {
                    const userStore = db.createObjectStore('users', { keyPath: 'id' });
                    userStore.createIndex('email', 'email', { unique: true });
                    userStore.createIndex('role', 'role', { unique: false });
                    console.log('Users object store created');
                }

                // Create Watchlist object store
                if (!db.objectStoreNames.contains('watchlist')) {
                    const watchlistStore = db.createObjectStore('watchlist', { keyPath: 'id', autoIncrement: true });
                    watchlistStore.createIndex('userId', 'userId', { unique: false });
                    watchlistStore.createIndex('symbol', 'symbol', { unique: false });
                    watchlistStore.createIndex('listName', 'listName', { unique: false });
                    console.log('Watchlist object store created');
                }

                // Create Alerts object store
                if (!db.objectStoreNames.contains('alerts')) {
                    const alertStore = db.createObjectStore('alerts', { keyPath: 'id', autoIncrement: true });
                    alertStore.createIndex('userId', 'userId', { unique: false });
                    alertStore.createIndex('symbol', 'symbol', { unique: false });
                    alertStore.createIndex('isActive', 'isActive', { unique: false });
                    console.log('Alerts object store created');
                }

                console.log('Database setup complete');
            };
        });
    }

    // ==================== TRADE OPERATIONS ====================

    async addTrade(trade) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['trades'], 'readwrite');
            const store = transaction.objectStore('trades');
            
            const tradeData = {
                ...trade,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            const request = store.add(tradeData);

            request.onsuccess = () => {
                console.log('Trade added with ID:', request.result);
                resolve(request.result);
            };

            request.onerror = () => {
                console.error('Failed to add trade:', request.error);
                reject(request.error);
            };
        });
    }

    async getAllTrades(userId) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['trades'], 'readonly');
            const store = transaction.objectStore('trades');
            const index = store.index('userId');
            const request = index.getAll(userId);

            request.onsuccess = () => {
                // Sort by date descending
                const trades = request.result.sort((a, b) => 
                    new Date(b.tradeDate) - new Date(a.tradeDate)
                );
                resolve(trades);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    async getTradesBySymbol(userId, symbol) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['trades'], 'readonly');
            const store = transaction.objectStore('trades');
            const index = store.index('userSymbol');
            const request = index.getAll([userId, symbol]);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    async getTradesByDateRange(userId, startDate, endDate) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['trades'], 'readonly');
            const store = transaction.objectStore('trades');
            const index = store.index('userDate');
            
            const range = IDBKeyRange.bound([userId, startDate], [userId, endDate]);
            const request = index.getAll(range);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    async getTradesByType(userId, type) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['trades'], 'readonly');
            const store = transaction.objectStore('trades');
            const request = store.getAll();

            request.onsuccess = () => {
                const filtered = request.result.filter(t => 
                    t.userId === userId && t.type === type
                );
                resolve(filtered);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    async updateTrade(id, updates) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['trades'], 'readwrite');
            const store = transaction.objectStore('trades');
            const getRequest = store.get(id);

            getRequest.onsuccess = () => {
                const trade = getRequest.result;
                if (!trade) {
                    reject(new Error('Trade not found'));
                    return;
                }

                const updatedTrade = {
                    ...trade,
                    ...updates,
                    updatedAt: new Date().toISOString()
                };

                const updateRequest = store.put(updatedTrade);

                updateRequest.onsuccess = () => {
                    resolve(updatedTrade);
                };

                updateRequest.onerror = () => {
                    reject(updateRequest.error);
                };
            };

            getRequest.onerror = () => {
                reject(getRequest.error);
            };
        });
    }

    async deleteTrade(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['trades'], 'readwrite');
            const store = transaction.objectStore('trades');
            const request = store.delete(id);

            request.onsuccess = () => {
                resolve(true);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    // ==================== POSITION OPERATIONS ====================

    async addPosition(position) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['positions'], 'readwrite');
            const store = transaction.objectStore('positions');
            
            const positionData = {
                ...position,
                lastUpdated: new Date().toISOString()
            };
            
            const request = store.add(positionData);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    async getAllPositions(userId) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['positions'], 'readonly');
            const store = transaction.objectStore('positions');
            const index = store.index('userId');
            const request = index.getAll(userId);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    async getPositionBySymbol(userId, symbol) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['positions'], 'readonly');
            const store = transaction.objectStore('positions');
            const index = store.index('userSymbol');
            const request = index.get([userId, symbol]);

            request.onsuccess = () => {
                resolve(request.result || null);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    async updatePosition(id, updates) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['positions'], 'readwrite');
            const store = transaction.objectStore('positions');
            const getRequest = store.get(id);

            getRequest.onsuccess = () => {
                const position = getRequest.result;
                if (!position) {
                    reject(new Error('Position not found'));
                    return;
                }

                const updatedPosition = {
                    ...position,
                    ...updates,
                    lastUpdated: new Date().toISOString()
                };

                const updateRequest = store.put(updatedPosition);

                updateRequest.onsuccess = () => {
                    resolve(updatedPosition);
                };

                updateRequest.onerror = () => {
                    reject(updateRequest.error);
                };
            };

            getRequest.onerror = () => {
                reject(getRequest.error);
            };
        });
    }

    async deletePosition(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['positions'], 'readwrite');
            const store = transaction.objectStore('positions');
            const request = store.delete(id);

            request.onsuccess = () => {
                resolve(true);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    async upsertPosition(userId, symbol, positionData) {
        const existing = await this.getPositionBySymbol(userId, symbol);
        if (existing) {
            return await this.updatePosition(existing.id, positionData);
        } else {
            return await this.addPosition({ userId, symbol, ...positionData });
        }
    }

    // ==================== KITE PROFILE OPERATIONS ====================

    async addKiteProfile(profile) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['kiteProfiles'], 'readwrite');
            const store = transaction.objectStore('kiteProfiles');
            
            const profileData = {
                ...profile,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            const request = store.add(profileData);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    async getKiteProfiles(userId) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['kiteProfiles'], 'readonly');
            const store = transaction.objectStore('kiteProfiles');
            const index = store.index('userId');
            const request = index.getAll(userId);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    async updateKiteProfile(id, updates) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['kiteProfiles'], 'readwrite');
            const store = transaction.objectStore('kiteProfiles');
            const getRequest = store.get(id);

            getRequest.onsuccess = () => {
                const profile = getRequest.result;
                if (!profile) {
                    reject(new Error('Profile not found'));
                    return;
                }

                const updatedProfile = {
                    ...profile,
                    ...updates,
                    updatedAt: new Date().toISOString()
                };

                const updateRequest = store.put(updatedProfile);

                updateRequest.onsuccess = () => {
                    resolve(updatedProfile);
                };

                updateRequest.onerror = () => {
                    reject(updateRequest.error);
                };
            };

            getRequest.onerror = () => {
                reject(getRequest.error);
            };
        });
    }

    async deleteKiteProfile(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['kiteProfiles'], 'readwrite');
            const store = transaction.objectStore('kiteProfiles');
            const request = store.delete(id);

            request.onsuccess = () => {
                resolve(true);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    // ==================== WATCHLIST OPERATIONS ====================

    async addToWatchlist(userId, symbol, listName = 'default') {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['watchlist'], 'readwrite');
            const store = transaction.objectStore('watchlist');
            
            const watchlistData = {
                userId,
                symbol,
                listName,
                addedAt: new Date().toISOString()
            };
            
            const request = store.add(watchlistData);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    async getWatchlist(userId, listName = null) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['watchlist'], 'readonly');
            const store = transaction.objectStore('watchlist');
            const index = store.index('userId');
            const request = index.getAll(userId);

            request.onsuccess = () => {
                let result = request.result;
                if (listName) {
                    result = result.filter(item => item.listName === listName);
                }
                resolve(result);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    async removeFromWatchlist(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['watchlist'], 'readwrite');
            const store = transaction.objectStore('watchlist');
            const request = store.delete(id);

            request.onsuccess = () => {
                resolve(true);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    // ==================== EXPORT/IMPORT OPERATIONS ====================

    async exportData(userId) {
        const trades = await this.getAllTrades(userId);
        const positions = await this.getAllPositions(userId);
        const kiteProfiles = await this.getKiteProfiles(userId);
        const watchlist = await this.getWatchlist(userId);

        return {
            version: this.version,
            exportDate: new Date().toISOString(),
            userId,
            trades,
            positions,
            kiteProfiles,
            watchlist
        };
    }

    async importData(data, userId) {
        try {
            // Import trades
            if (data.trades) {
                for (const trade of data.trades) {
                    const { id, ...tradeData } = trade;
                    await this.addTrade({ ...tradeData, userId });
                }
            }

            // Import positions
            if (data.positions) {
                for (const position of data.positions) {
                    const { id, ...positionData } = position;
                    await this.addPosition({ ...positionData, userId });
                }
            }

            // Import kite profiles
            if (data.kiteProfiles) {
                for (const profile of data.kiteProfiles) {
                    const { id, ...profileData } = profile;
                    await this.addKiteProfile({ ...profileData, userId });
                }
            }

            // Import watchlist
            if (data.watchlist) {
                for (const item of data.watchlist) {
                    const { id, ...watchlistData } = item;
                    await this.addToWatchlist(userId, watchlistData.symbol, watchlistData.listName);
                }
            }

            return true;
        } catch (error) {
            console.error('Import failed:', error);
            throw error;
        }
    }

    // ==================== UTILITY OPERATIONS ====================

    async clearAllData() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(
                ['trades', 'positions', 'kiteProfiles', 'watchlist', 'alerts'], 
                'readwrite'
            );
            
            transaction.objectStore('trades').clear();
            transaction.objectStore('positions').clear();
            transaction.objectStore('kiteProfiles').clear();
            transaction.objectStore('watchlist').clear();
            transaction.objectStore('alerts').clear();

            transaction.oncomplete = () => {
                resolve(true);
            };

            transaction.onerror = () => {
                reject(transaction.error);
            };
        });
    }

    async clearUserData(userId) {
        const trades = await this.getAllTrades(userId);
        const positions = await this.getAllPositions(userId);
        const profiles = await this.getKiteProfiles(userId);
        const watchlist = await this.getWatchlist(userId);

        for (const trade of trades) {
            await this.deleteTrade(trade.id);
        }
        for (const position of positions) {
            await this.deletePosition(position.id);
        }
        for (const profile of profiles) {
            await this.deleteKiteProfile(profile.id);
        }
        for (const item of watchlist) {
            await this.removeFromWatchlist(item.id);
        }

        return true;
    }
}

// Export for use in app
window.StockDB = StockDB;
