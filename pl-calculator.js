// P&L Calculator - Realized and unrealized profit/loss
class PLCalculator {
    static calculateRealizedPL(trades) {
        const symbolTrades = {};
        
        // Group by symbol
        trades.forEach(trade => {
            if (!symbolTrades[trade.symbol]) {
                symbolTrades[trade.symbol] = { buys: [], sells: [] };
            }
            if (trade.type === 'BUY') {
                symbolTrades[trade.symbol].buys.push(trade);
            } else {
                symbolTrades[trade.symbol].sells.push(trade);
            }
        });

        let totalRealizedPL = 0;

        // Calculate realized P&L using FIFO
        Object.values(symbolTrades).forEach(({ buys, sells }) => {
            buys.sort((a, b) => new Date(a.tradeDate) - new Date(b.tradeDate));
            sells.sort((a, b) => new Date(a.tradeDate) - new Date(b.tradeDate));

            let buyIndex = 0;
            let buyRemaining = buys[0]?.quantity || 0;

            sells.forEach(sell => {
                let sellRemaining = sell.quantity;

                while (sellRemaining > 0 && buyIndex < buys.length) {
                    const buy = buys[buyIndex];
                    const matchQty = Math.min(sellRemaining, buyRemaining);

                    const buyValue = (buy.netAmount / buy.quantity) * matchQty;
                    const sellValue = (sell.netAmount / sell.quantity) * matchQty;
                    const pl = sellValue - buyValue;

                    totalRealizedPL += pl;

                    sellRemaining -= matchQty;
                    buyRemaining -= matchQty;

                    if (buyRemaining === 0) {
                        buyIndex++;
                        buyRemaining = buys[buyIndex]?.quantity || 0;
                    }
                }
            });
        });

        return totalRealizedPL;
    }

    static calculateTotalPL(trades, positions) {
        const realizedPL = this.calculateRealizedPL(trades);
        const unrealizedPL = positions.reduce((sum, p) => sum + (p.unrealizedPL || 0), 0);

        return {
            realizedPL,
            unrealizedPL,
            totalPL: realizedPL + unrealizedPL
        };
    }

    static calculatePLByStock(trades, symbol) {
        const symbolTrades = trades.filter(t => t.symbol === symbol);
        return this.calculateRealizedPL(symbolTrades);
    }

    static calculatePLByPeriod(trades, startDate, endDate) {
        const periodTrades = trades.filter(t => 
            t.tradeDate >= startDate && t.tradeDate <= endDate
        );
        return this.calculateRealizedPL(periodTrades);
    }
}

window.PLCalculator = PLCalculator;
