// Main Stock Trading Dashboard Application
class StockApp {
    constructor(db, authManager) {
        this.db = db;
        this.authManager = authManager;
        this.trades = [];
        this.positions = [];
        this.currentView = 'dashboard';
    }

    async init() {
        try {
            await this.loadData();
            this.setupNavigation();
            this.setupModals();
            this.setupForms();
            this.setupFilters();
            this.render();
        } catch (error) {
            console.error('Failed to initialize app:', error);
            alert('Failed to initialize app. Please refresh the page.');
        }
    }

    async loadData() {
        try {
            const userId = this.authManager.getUserId();
            this.trades = await this.db.getAllTrades(userId);
            this.positions = await this.db.getAllPositions(userId);
            console.log('Data loaded - Trades:', this.trades.length, 'Positions:', this.positions.length);
        } catch (error) {
            console.error('Failed to load data:', error);
        }
    }

    setupNavigation() {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const view = btn.dataset.view;
                this.switchView(view);
            });
        });
    }

    switchView(viewName) {
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        
        document.getElementById(viewName).classList.add('active');
        document.querySelector(`[data-view="${viewName}"]`).classList.add('active');

        this.currentView = viewName;

        if (viewName === 'analytics') {
            this.renderCharts();
        } else if (viewName === 'portfolio') {
            this.renderPortfolio();
        } else if (viewName === 'trades') {
            this.renderTrades();
        } else if (viewName === 'dashboard') {
            this.renderDashboard();
        }
    }

    setupModals() {
        const tradeModal = document.getElementById('trade-modal');

        // Close modal when clicking X
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', () => {
                tradeModal.classList.remove('active');
            });
        });

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === tradeModal) {
                tradeModal.classList.remove('active');
            }
        });
    }

    setupForms() {
        const tradeForm = document.getElementById('trade-form');
        if (tradeForm) {
            tradeForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.addTrade();
            });

            // Calculate net amount on input change
            ['trade-quantity', 'trade-price', 'trade-brokerage', 'trade-taxes'].forEach(id => {
                const input = document.getElementById(id);
                if (input) {
                    input.addEventListener('input', () => this.updateNetAmount());
                }
            });

            // Set default date to today
            const dateInput = document.getElementById('trade-date');
            if (dateInput) {
                dateInput.valueAsDate = new Date();
            }
        }
    }

    setupFilters() {
        const searchInput = document.getElementById('trade-search');
        const typeFilter = document.getElementById('trade-type-filter');
        const dateFrom = document.getElementById('trade-date-from');
        const dateTo = document.getElementById('trade-date-to');

        [searchInput, typeFilter, dateFrom, dateTo].forEach(input => {
            if (input) {
                input.addEventListener('change', () => this.renderTrades());
                input.addEventListener('input', () => this.renderTrades());
            }
        });
    }

    updateNetAmount() {
        const quantity = parseFloat(document.getElementById('trade-quantity').value) || 0;
        const price = parseFloat(document.getElementById('trade-price').value) || 0;
        const brokerage = parseFloat(document.getElementById('trade-brokerage').value) || 0;
        const taxes = parseFloat(document.getElementById('trade-taxes').value) || 0;
        const type = document.getElementById('trade-type').value;

        const amount = quantity * price;
        const netAmount = type === 'BUY' ? 
            amount + brokerage + taxes : 
            amount - brokerage - taxes;

        document.getElementById('net-amount').textContent = netAmount.toFixed(2);
    }

    async addTrade() {
        try {
            const trade = {
                userId: this.authManager.getUserId(),
                symbol: document.getElementById('trade-symbol').value.toUpperCase(),
                exchange: document.getElementById('trade-exchange').value,
                type: document.getElementById('trade-type').value,
                quantity: parseInt(document.getElementById('trade-quantity').value),
                price: parseFloat(document.getElementById('trade-price').value),
                brokerage: parseFloat(document.getElementById('trade-brokerage').value) || 0,
                taxes: parseFloat(document.getElementById('trade-taxes').value) || 0,
                tradeDate: document.getElementById('trade-date').value,
                tradeTime: document.getElementById('trade-time').value || null,
                notes: document.getElementById('trade-notes').value || null,
                source: 'MANUAL'
            };

            // Calculate amounts
            trade.amount = trade.quantity * trade.price;
            trade.netAmount = trade.type === 'BUY' ? 
                trade.amount + trade.brokerage + trade.taxes : 
                trade.amount - trade.brokerage - trade.taxes;

            await this.db.addTrade(trade);
            await this.loadData();
            
            document.getElementById('trade-modal').classList.remove('active');
            document.getElementById('trade-form').reset();
            
            // Recalculate positions
            await this.recalculatePositions();
            
            this.render();
            alert('Trade added successfully!');
        } catch (error) {
            console.error('Failed to add trade:', error);
            alert('Failed to add trade. Please try again.');
        }
    }

    async deleteTrade(id) {
        if (confirm('Delete this trade?')) {
            try {
                await this.db.deleteTrade(id);
                await this.loadData();
                await this.recalculatePositions();
                this.render();
            } catch (error) {
                console.error('Failed to delete trade:', error);
                alert('Failed to delete trade.');
            }
        }
    }

    async recalculatePositions() {
        const userId = this.authManager.getUserId();
        const trades = await this.db.getAllTrades(userId);
        
        // Group trades by symbol
        const symbolTrades = {};
        trades.forEach(trade => {
            if (!symbolTrades[trade.symbol]) {
                symbolTrades[trade.symbol] = [];
            }
            symbolTrades[trade.symbol].push(trade);
        });

        // Calculate position for each symbol
        for (const [symbol, symbolTradeList] of Object.entries(symbolTrades)) {
            let totalQuantity = 0;
            let totalInvested = 0;

            symbolTradeList.forEach(trade => {
                if (trade.type === 'BUY') {
                    totalQuantity += trade.quantity;
                    totalInvested += trade.netAmount;
                } else {
                    totalQuantity -= trade.quantity;
                    // For sells, reduce invested proportionally
                    const avgPrice = totalInvested / (totalQuantity + trade.quantity);
                    totalInvested -= avgPrice * trade.quantity;
                }
            });

            if (totalQuantity > 0) {
                const averageBuyPrice = totalInvested / totalQuantity;
                const position = {
                    userId,
                    symbol,
                    exchange: symbolTradeList[0].exchange,
                    quantity: totalQuantity,
                    averageBuyPrice: averageBuyPrice,
                    investedValue: totalInvested,
                    currentPrice: averageBuyPrice, // Will be updated with real price
                    currentValue: totalQuantity * averageBuyPrice,
                    unrealizedPL: 0,
                    unrealizedPLPercent: 0
                };

                await this.db.upsertPosition(userId, symbol, position);
            } else {
                // Position closed, remove it
                const existing = await this.db.getPositionBySymbol(userId, symbol);
                if (existing) {
                    await this.db.deletePosition(existing.id);
                }
            }
        }

        // Reload positions
        this.positions = await this.db.getAllPositions(userId);
    }

    render() {
        if (this.currentView === 'dashboard') {
            this.renderDashboard();
        } else if (this.currentView === 'portfolio') {
            this.renderPortfolio();
        } else if (this.currentView === 'trades') {
            this.renderTrades();
        }
    }

    renderDashboard() {
        // Calculate stats
        const totalTrades = this.trades.length;
        const portfolioValue = this.positions.reduce((sum, p) => sum + (p.currentValue || 0), 0);
        const totalPL = this.positions.reduce((sum, p) => sum + (p.unrealizedPL || 0), 0);
        const totalPLPercent = portfolioValue > 0 ? (totalPL / (portfolioValue - totalPL)) * 100 : 0;

        document.getElementById('portfolio-value').textContent = `₹${portfolioValue.toFixed(2)}`;
        document.getElementById('total-pl').textContent = `₹${totalPL.toFixed(2)}`;
        document.getElementById('total-pl-percent').textContent = `${totalPLPercent.toFixed(2)}%`;
        document.getElementById('total-trades').textContent = totalTrades;

        // Color code P&L
        const plElement = document.getElementById('total-pl');
        const plPercentElement = document.getElementById('total-pl-percent');
        if (totalPL >= 0) {
            plElement.style.color = '#28a745';
            plPercentElement.style.color = '#28a745';
        } else {
            plElement.style.color = '#dc3545';
            plPercentElement.style.color = '#dc3545';
        }

        // Recent trades
        this.renderRecentTrades();
        
        // Top performers
        this.renderTopPerformers();
    }

    renderRecentTrades() {
        const container = document.getElementById('recent-trades');
        const recent = this.trades.slice(0, 10);

        if (recent.length === 0) {
            container.innerHTML = '<p style="color: #6c757d;">No trades yet. Click "Trades" to add your first trade.</p>';
            return;
        }

        container.innerHTML = recent.map(trade => `
            <div style="padding: 10px; border-bottom: 1px solid #dee2e6; display: flex; justify-content: space-between;">
                <div>
                    <strong>${trade.symbol}</strong>
                    <span style="margin-left: 10px; color: ${trade.type === 'BUY' ? '#28a745' : '#dc3545'};">
                        ${trade.type}
                    </span>
                    <span style="margin-left: 10px; color: #6c757d;">
                        ${trade.quantity} @ ₹${trade.price}
                    </span>
                </div>
                <div style="color: #6c757d;">
                    ${new Date(trade.tradeDate).toLocaleDateString()}
                </div>
            </div>
        `).join('');
    }

    renderTopPerformers() {
        const container = document.getElementById('top-performers');
        
        const sorted = [...this.positions].sort((a, b) => 
            (b.unrealizedPLPercent || 0) - (a.unrealizedPLPercent || 0)
        );

        const top = sorted.slice(0, 5);

        if (top.length === 0) {
            container.innerHTML = '<p style="color: #6c757d;">No positions yet.</p>';
            return;
        }

        container.innerHTML = top.map(pos => `
            <div style="padding: 10px; border-bottom: 1px solid #dee2e6; display: flex; justify-content: space-between;">
                <div>
                    <strong>${pos.symbol}</strong>
                    <span style="margin-left: 10px; color: #6c757d;">
                        ${pos.quantity} shares
                    </span>
                </div>
                <div style="color: ${(pos.unrealizedPL || 0) >= 0 ? '#28a745' : '#dc3545'}; font-weight: 600;">
                    ${(pos.unrealizedPLPercent || 0).toFixed(2)}%
                </div>
            </div>
        `).join('');
    }

    renderPortfolio() {
        const container = document.getElementById('portfolio-list');

        if (this.positions.length === 0) {
            container.innerHTML = '<div class="empty-state"><h3>No positions</h3><p>Add trades to build your portfolio</p></div>';
            return;
        }

        container.innerHTML = `
            <table style="width: 100%; background: white; border-radius: 12px; overflow: hidden;">
                <thead style="background: #f8f9fa;">
                    <tr>
                        <th style="padding: 15px; text-align: left;">Symbol</th>
                        <th style="padding: 15px; text-align: right;">Qty</th>
                        <th style="padding: 15px; text-align: right;">Avg Price</th>
                        <th style="padding: 15px; text-align: right;">Current Price</th>
                        <th style="padding: 15px; text-align: right;">Invested</th>
                        <th style="padding: 15px; text-align: right;">Current Value</th>
                        <th style="padding: 15px; text-align: right;">P&L</th>
                        <th style="padding: 15px; text-align: right;">P&L %</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.positions.map(pos => `
                        <tr style="border-bottom: 1px solid #dee2e6;">
                            <td style="padding: 15px;"><strong>${pos.symbol}</strong></td>
                            <td style="padding: 15px; text-align: right;">${pos.quantity}</td>
                            <td style="padding: 15px; text-align: right;">₹${pos.averageBuyPrice.toFixed(2)}</td>
                            <td style="padding: 15px; text-align: right;">₹${(pos.currentPrice || pos.averageBuyPrice).toFixed(2)}</td>
                            <td style="padding: 15px; text-align: right;">₹${pos.investedValue.toFixed(2)}</td>
                            <td style="padding: 15px; text-align: right;">₹${(pos.currentValue || pos.investedValue).toFixed(2)}</td>
                            <td style="padding: 15px; text-align: right; color: ${(pos.unrealizedPL || 0) >= 0 ? '#28a745' : '#dc3545'}; font-weight: 600;">
                                ₹${(pos.unrealizedPL || 0).toFixed(2)}
                            </td>
                            <td style="padding: 15px; text-align: right; color: ${(pos.unrealizedPL || 0) >= 0 ? '#28a745' : '#dc3545'}; font-weight: 600;">
                                ${(pos.unrealizedPLPercent || 0).toFixed(2)}%
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    renderTrades() {
        const container = document.getElementById('trades-list');
        
        // Apply filters
        let filtered = [...this.trades];
        
        const searchTerm = document.getElementById('trade-search')?.value.toUpperCase();
        if (searchTerm) {
            filtered = filtered.filter(t => t.symbol.includes(searchTerm));
        }

        const typeFilter = document.getElementById('trade-type-filter')?.value;
        if (typeFilter) {
            filtered = filtered.filter(t => t.type === typeFilter);
        }

        const dateFrom = document.getElementById('trade-date-from')?.value;
        if (dateFrom) {
            filtered = filtered.filter(t => t.tradeDate >= dateFrom);
        }

        const dateTo = document.getElementById('trade-date-to')?.value;
        if (dateTo) {
            filtered = filtered.filter(t => t.tradeDate <= dateTo);
        }

        if (filtered.length === 0) {
            container.innerHTML = '<div class="empty-state"><h3>No trades found</h3><p>Try adjusting your filters</p></div>';
            return;
        }

        container.innerHTML = `
            <table style="width: 100%; background: white; border-radius: 12px; overflow: hidden;">
                <thead style="background: #f8f9fa;">
                    <tr>
                        <th style="padding: 15px; text-align: left;">Date</th>
                        <th style="padding: 15px; text-align: left;">Symbol</th>
                        <th style="padding: 15px; text-align: center;">Type</th>
                        <th style="padding: 15px; text-align: right;">Qty</th>
                        <th style="padding: 15px; text-align: right;">Price</th>
                        <th style="padding: 15px; text-align: right;">Amount</th>
                        <th style="padding: 15px; text-align: center;">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${filtered.map(trade => `
                        <tr style="border-bottom: 1px solid #dee2e6;">
                            <td style="padding: 15px;">${new Date(trade.tradeDate).toLocaleDateString()}</td>
                            <td style="padding: 15px;"><strong>${trade.symbol}</strong></td>
                            <td style="padding: 15px; text-align: center;">
                                <span style="padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; 
                                    background: ${trade.type === 'BUY' ? '#d4edda' : '#f8d7da'}; 
                                    color: ${trade.type === 'BUY' ? '#155724' : '#721c24'};">
                                    ${trade.type}
                                </span>
                            </td>
                            <td style="padding: 15px; text-align: right;">${trade.quantity}</td>
                            <td style="padding: 15px; text-align: right;">₹${trade.price.toFixed(2)}</td>
                            <td style="padding: 15px; text-align: right;">₹${trade.netAmount.toFixed(2)}</td>
                            <td style="padding: 15px; text-align: center;">
                                <button onclick="window.stockApp.deleteTrade(${trade.id})" 
                                    style="padding: 6px 12px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;">
                                    Delete
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    renderCharts() {
        // Placeholder for charts - will be implemented with Chart.js
        console.log('Charts rendering...');
    }
}

// Global functions for onclick handlers
function openTradeModal() {
    document.getElementById('trade-modal').classList.add('active');
    document.getElementById('trade-date').valueAsDate = new Date();
}

function closeTradeModal() {
    document.getElementById('trade-modal').classList.remove('active');
}

function refreshPrices() {
    alert('Price refresh feature coming soon with Kite API integration!');
}

function exportData() {
    if (window.stockApp) {
        window.stockApp.db.exportData(window.stockApp.authManager.getUserId())
            .then(data => {
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `stock-trading-data-${Date.now()}.json`;
                a.click();
                URL.revokeObjectURL(url);
            });
    }
}

// Export for use
window.StockApp = StockApp;
