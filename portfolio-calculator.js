// Portfolio Calculator - P&L and position calculations
class PortfolioCalculator {
    static calculatePositions(trades) {
        const positions = {};
        
        trades.forEach(trade => {
            if (!positions[trade.symbol]) {
                positions[trade.symbol] = {
                    symbol: trade.symbol,
                    exchange: trade.exchange,
                    quantity: 0,
                    totalInvested: 0,
                    trades: []
                };
            }

            const pos = positions[trade.symbol];
            pos.trades.push(trade);

            if (trade.type === 'BUY') {
                pos.quantity += trade.quantity;
                pos.totalInvested += trade.netAmount;
            } else {
                pos.quantity -= trade.quantity;
                const avgPrice = pos.totalInvested / (pos.quantity + trade.quantity);
                pos.totalInvested -= avgPrice * trade.quantity;
            }
        });

        return Object.values(positions).filter(p => p.quantity > 0);
    }

    static calculateAverageBuyPrice(position) {
        return position.totalInvested / position.quantity;
    }

    static calculateUnrealizedPL(position, currentPrice) {
        const avgPrice = this.calculateAverageBuyPrice(position);
        const currentValue = position.quantity * currentPrice;
        const unrealizedPL = currentValue - position.totalInvested;
        const unrealizedPLPercent = (unrealizedPL / position.totalInvested) * 100;

        return {
            unrealizedPL,
            unrealizedPLPercent,
            currentValue
        };
    }

    static calculatePortfolioValue(positions) {
        return positions.reduce((sum, p) => sum + (p.currentValue || 0), 0);
    }
}

window.PortfolioCalculator = PortfolioCalculator;
