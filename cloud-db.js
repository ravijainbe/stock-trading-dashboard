// Cloud Database Manager with Supabase + IndexedDB sync
class CloudDB extends StockDB {
    constructor(authManager) {
        super();
        this.authManager = authManager;
        this.supabaseUrl = 'https://gccjgjulqjzagxuffzqj.supabase.co';
        this.supabaseKey = 'YOUR_SUPABASE_ANON_KEY'; // TODO: Add your anon key from Supabase Settings → API
        this.supabase = null;
        this.syncEnabled = true;
    }

    async init() {
        // Initialize local IndexedDB first
        await super.init();

        // Check if Supabase is configured
        if (this.supabaseUrl.includes('YOUR_SUPABASE')) {
            console.warn('Cloud sync not configured. Using local storage only.');
            this.syncEnabled = false;
            return;
        }

        // Initialize Supabase client
        this.supabase = supabase.createClient(this.supabaseUrl, this.supabaseKey);
        this.syncEnabled = true;

        console.log('CloudDB initialized. Manual sync available.');
    }

    // ==================== TRADE SYNC OPERATIONS ====================

    async addTrade(trade) {
        const localId = await super.addTrade(trade);

        if (this.syncEnabled && this.authManager.isAuthenticated()) {
            try {
                const tradeData = {
                    ...trade,
                    user_id: this.authManager.getUserId(),
                    local_id: localId,
                    synced_at: new Date().toISOString()
                };

                const { data, error } = await this.supabase
                    .from('trades')
                    .insert([tradeData])
                    .select();

                if (error) throw error;
                console.log('Trade synced to cloud');
            } catch (error) {
                console.error('Failed to sync trade to cloud (local save succeeded):', error);
            }
        }

        return localId;
    }

    async updateTrade(id, updates) {
        const updated = await super.updateTrade(id, updates);

        if (this.syncEnabled && this.authManager.isAuthenticated()) {
            try {
                const { error } = await this.supabase
                    .from('trades')
                    .update(updates)
                    .eq('local_id', id)
                    .eq('user_id', this.authManager.getUserId());

                if (error) throw error;
            } catch (error) {
                console.error('Failed to sync trade update to cloud:', error);
            }
        }

        return updated;
    }

    async deleteTrade(id) {
        await super.deleteTrade(id);

        if (this.syncEnabled && this.authManager.isAuthenticated()) {
            try {
                const { error } = await this.supabase
                    .from('trades')
                    .delete()
                    .eq('local_id', id)
                    .eq('user_id', this.authManager.getUserId());

                if (error) throw error;
            } catch (error) {
                console.error('Failed to delete trade from cloud:', error);
            }
        }
    }

    // ==================== POSITION SYNC OPERATIONS ====================

    async upsertPosition(userId, symbol, positionData) {
        const result = await super.upsertPosition(userId, symbol, positionData);

        if (this.syncEnabled && this.authManager.isAuthenticated()) {
            try {
                const cloudData = {
                    user_id: userId,
                    symbol: positionData.symbol || symbol,
                    exchange: positionData.exchange,
                    quantity: positionData.quantity,
                    average_buy_price: positionData.averageBuyPrice,
                    current_price: positionData.currentPrice,
                    invested_value: positionData.investedValue,
                    current_value: positionData.currentValue,
                    unrealized_pl: positionData.unrealizedPL,
                    unrealized_pl_percent: positionData.unrealizedPLPercent,
                    last_updated: new Date().toISOString()
                };

                const { error } = await this.supabase
                    .from('positions')
                    .upsert(cloudData, { onConflict: 'user_id,symbol,exchange' });

                if (error) throw error;
            } catch (error) {
                console.error('Failed to sync position to cloud:', error);
            }
        }

        return result;
    }

    // ==================== KITE PROFILE SYNC OPERATIONS ====================

    async addKiteProfile(profile) {
        const localId = await super.addKiteProfile(profile);

        if (this.syncEnabled && this.authManager.isAuthenticated()) {
            try {
                const profileData = {
                    ...profile,
                    user_id: this.authManager.getUserId(),
                    local_id: localId,
                    synced_at: new Date().toISOString()
                };

                const { data, error } = await this.supabase
                    .from('kite_profiles')
                    .insert([profileData])
                    .select();

                if (error) throw error;
            } catch (error) {
                console.error('Failed to sync Kite profile to cloud:', error);
            }
        }

        return localId;
    }

    async updateKiteProfile(id, updates) {
        const updated = await super.updateKiteProfile(id, updates);

        if (this.syncEnabled && this.authManager.isAuthenticated()) {
            try {
                const { error } = await this.supabase
                    .from('kite_profiles')
                    .update(updates)
                    .eq('local_id', id)
                    .eq('user_id', this.authManager.getUserId());

                if (error) throw error;
            } catch (error) {
                console.error('Failed to sync Kite profile update to cloud:', error);
            }
        }

        return updated;
    }

    // ==================== CLOUD SYNC OPERATIONS ====================

    async syncFromCloud() {
        if (!this.syncEnabled || !this.authManager.isAuthenticated()) {
            console.log('syncFromCloud - Skipped (not enabled or not authenticated)');
            return;
        }

        try {
            const userId = this.authManager.getUserId();
            console.log('syncFromCloud - Fetching data from cloud for user:', userId);

            // Fetch trades from cloud
            const { data: trades, error: tradesError } = await this.supabase
                .from('trades')
                .select('*')
                .eq('user_id', userId);

            if (tradesError) {
                console.warn('syncFromCloud - Failed to fetch trades:', tradesError);
                throw tradesError;
            }

            // Fetch positions from cloud
            const { data: positions, error: positionsError } = await this.supabase
                .from('positions')
                .select('*')
                .eq('user_id', userId);

            if (positionsError) {
                console.warn('syncFromCloud - Failed to fetch positions:', positionsError);
                throw positionsError;
            }

            // Fetch Kite profiles from cloud
            const { data: profiles, error: profilesError } = await this.supabase
                .from('kite_profiles')
                .select('*')
                .eq('user_id', userId);

            if (profilesError) {
                console.warn('syncFromCloud - Failed to fetch profiles:', profilesError);
                throw profilesError;
            }

            console.log(`syncFromCloud - Fetched ${trades?.length || 0} trades, ${positions?.length || 0} positions, ${profiles?.length || 0} profiles`);

            // Get local data to compare
            const localTrades = await super.getAllTrades(userId);
            const localPositions = await super.getAllPositions(userId);
            const localProfiles = await super.getKiteProfiles(userId);

            console.log(`syncFromCloud - Local data: ${localTrades.length} trades, ${localPositions.length} positions, ${localProfiles.length} profiles`);

            const cloudHasData = (trades && trades.length > 0) || (positions && positions.length > 0) || (profiles && profiles.length > 0);
            const localHasData = localTrades.length > 0 || localPositions.length > 0 || localProfiles.length > 0;

            // If cloud is empty but local has data, sync TO cloud instead
            if (!cloudHasData && localHasData) {
                console.log('syncFromCloud - Cloud is empty but local has data. Syncing local TO cloud instead.');
                await this.syncToCloud();
                return;
            }

            // Only clear and sync if cloud has data
            if (cloudHasData) {
                console.log('syncFromCloud - Clearing local data and importing from cloud');
                await this.clearUserData(userId);

                // Import trades from cloud
                if (trades) {
                    for (const trade of trades) {
                        const { user_id, local_id, synced_at, id: cloudId, ...tradeData } = trade;
                        await super.addTrade({ ...tradeData, userId });
                    }
                }

                // Import positions from cloud
                if (positions) {
                    for (const position of positions) {
                        const { user_id, id: cloudId, ...positionData } = position;
                        const localData = {
                            userId,
                            symbol: positionData.symbol,
                            exchange: positionData.exchange,
                            quantity: positionData.quantity,
                            averageBuyPrice: positionData.average_buy_price,
                            currentPrice: positionData.current_price,
                            investedValue: positionData.invested_value,
                            currentValue: positionData.current_value,
                            unrealizedPL: positionData.unrealized_pl,
                            unrealizedPLPercent: positionData.unrealized_pl_percent
                        };
                        await super.addPosition(localData);
                    }
                }

                // Import Kite profiles from cloud
                if (profiles) {
                    for (const profile of profiles) {
                        const { user_id, local_id, synced_at, id: cloudId, ...profileData } = profile;
                        await super.addKiteProfile({ ...profileData, userId });
                    }
                }

                console.log(`syncFromCloud - Successfully synced from cloud`);
            }
        } catch (error) {
            console.error('syncFromCloud - Error, keeping local data intact:', error);
        }
    }

    async syncToCloud() {
        if (!this.syncEnabled || !this.authManager.isAuthenticated()) {
            return;
        }

        try {
            const userId = this.authManager.getUserId();
            const trades = await super.getAllTrades(userId);
            const positions = await super.getAllPositions(userId);
            const profiles = await super.getKiteProfiles(userId);

            // Delete existing cloud data for this user
            await this.supabase.from('trades').delete().eq('user_id', userId);
            await this.supabase.from('positions').delete().eq('user_id', userId);
            await this.supabase.from('kite_profiles').delete().eq('user_id', userId);

            // Upload trades
            if (trades.length > 0) {
                const tradesData = trades.map(t => ({
                    ...t,
                    user_id: userId,
                    local_id: t.id,
                    synced_at: new Date().toISOString()
                }));

                const { error } = await this.supabase
                    .from('trades')
                    .insert(tradesData);

                if (error) throw error;
            }

            // Upload positions
            if (positions.length > 0) {
                const positionsData = positions.map(p => ({
                    user_id: userId,
                    symbol: p.symbol,
                    exchange: p.exchange,
                    quantity: p.quantity,
                    average_buy_price: p.averageBuyPrice,
                    current_price: p.currentPrice,
                    invested_value: p.investedValue,
                    current_value: p.currentValue,
                    unrealized_pl: p.unrealizedPL,
                    unrealized_pl_percent: p.unrealizedPLPercent,
                    last_updated: new Date().toISOString()
                }));

                const { error } = await this.supabase
                    .from('positions')
                    .insert(positionsData);

                if (error) throw error;
            }

            // Upload Kite profiles
            if (profiles.length > 0) {
                const profilesData = profiles.map(p => ({
                    ...p,
                    user_id: userId,
                    local_id: p.id,
                    synced_at: new Date().toISOString()
                }));

                const { error } = await this.supabase
                    .from('kite_profiles')
                    .insert(profilesData);

                if (error) throw error;
            }

            console.log(`Synced ${trades.length} trades, ${positions.length} positions, ${profiles.length} profiles to cloud`);
        } catch (error) {
            console.error('Failed to sync to cloud:', error);
            throw error;
        }
    }

    async manualSync() {
        if (!this.syncEnabled) {
            throw new Error('Cloud sync is not enabled');
        }

        if (!this.authManager.isAuthenticated()) {
            throw new Error('User must be authenticated to sync');
        }

        await this.syncFromCloud();
        return { success: true, message: 'Data synced successfully' };
    }
}

// Export for use in app
window.CloudDB = CloudDB;
