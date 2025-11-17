// Trade Manager - Additional trade management utilities
class TradeManager {
    constructor(db) {
        this.db = db;
    }

    async validateTrade(trade) {
        // Validate required fields
        if (!trade.symbol || !trade.type || !trade.quantity || !trade.price || !trade.tradeDate) {
            throw new Error('Missing required fields');
        }

        // Validate types
        if (!['BUY', 'SELL'].includes(trade.type)) {
            throw new Error('Invalid trade type');
        }

        if (trade.quantity <= 0 || trade.price <= 0) {
            throw new Error('Quantity and price must be positive');
        }

        return true;
    }

    async checkDuplicate(trade) {
        const userId = trade.userId;
        const existing = await this.db.getAllTrades(userId);
        
        const duplicate = existing.find(t => 
            t.symbol === trade.symbol &&
            t.type === trade.type &&
            t.quantity === trade.quantity &&
            t.price === trade.price &&
            t.tradeDate === trade.tradeDate
        );

        return duplicate !== undefined;
    }

    async importFromKite(userId, kiteClient) {
        // TODO: Implement Kite import
        console.log('Kite import - Coming soon');
    }
}

window.TradeManager = TradeManager;
