// Authentication Handler - Connects auth, database, and UI
let authManager;
let cloudDb;
let stockApp;

// Initialize authentication on page load
document.addEventListener('DOMContentLoaded', async () => {
    // Ensure correct initial state: show auth, hide app
    const authContainer = document.getElementById('auth-container');
    if (authContainer) authContainer.classList.remove('hidden');
    
    const appContainer = document.getElementById('app-container');
    if (appContainer) appContainer.classList.add('hidden');

    // Initialize auth manager
    authManager = new AuthManager();
    await authManager.init();

    // Setup form handlers
    setupAuthForms();

    // If user is authenticated, initialize the app
    if (authManager.isAuthenticated()) {
        await initializeApp();
    }
});

function setupAuthForms() {
    // Login form
    const loginForm = document.getElementById('login-form-element');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleLogin();
        });
    }

    // Signup form
    const signupForm = document.getElementById('signup-form-element');
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleSignup();
        });
    }

    // Forgot password form
    const forgotForm = document.getElementById('forgot-form-element');
    if (forgotForm) {
        forgotForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleForgotPassword();
        });
    }
}

async function handleLogin() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    showAuthMessage('Signing in...', 'info');

    const result = await authManager.signIn(email, password);

    if (result.success) {
        showAuthMessage('Login successful!', 'success');
        await initializeApp();
    } else {
        showAuthMessage(result.error || 'Login failed', 'error');
    }
}

async function handleSignup() {
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirm = document.getElementById('signup-confirm').value;
    const role = document.getElementById('signup-role').value;

    if (!role) {
        showAuthMessage('Please select a role', 'error');
        return;
    }

    if (password !== confirm) {
        showAuthMessage('Passwords do not match', 'error');
        return;
    }

    if (password.length < 6) {
        showAuthMessage('Password must be at least 6 characters', 'error');
        return;
    }

    showAuthMessage('Creating account...', 'info');

    const result = await authManager.signUp(email, password, name, role);

    if (result.success) {
        showAuthMessage('Account created! Please check your email to verify, then sign in.', 'success');
        setTimeout(() => {
            showLogin();
        }, 3000);
    } else {
        showAuthMessage(result.error || 'Signup failed', 'error');
    }
}

async function handleForgotPassword() {
    const email = document.getElementById('forgot-email').value;

    showAuthMessage('Sending reset link...', 'info');

    const result = await authManager.resetPassword(email);

    if (result.success) {
        showAuthMessage('Password reset link sent to your email!', 'success');
        setTimeout(() => {
            showLogin();
        }, 3000);
    } else {
        showAuthMessage(result.error || 'Failed to send reset link', 'error');
    }
}

async function logout() {
    if (confirm('Are you sure you want to logout?')) {
        const result = await authManager.signOut();
        if (result.success) {
            window.location.reload();
        }
    }
}

async function syncKiteData() {
    if (!cloudDb) {
        alert('Cloud sync is not available');
        return;
    }

    if (!window.stockApp) {
        alert('App not initialized yet');
        return;
    }

    try {
        const btn = event.target;
        btn.disabled = true;
        btn.textContent = '🔄 Syncing...';

        await cloudDb.manualSync();
        await window.stockApp.loadData();
        window.stockApp.render();

        btn.textContent = '✓ Synced!';
        setTimeout(() => {
            btn.textContent = '🔄 Sync';
            btn.disabled = false;
        }, 2000);
    } catch (error) {
        alert('Sync failed: ' + error.message);
        const btn = event.target;
        if (btn) {
            btn.disabled = false;
            btn.textContent = '🔄 Sync';
        }
    }
}

async function initializeApp() {
    try {
        console.log('Starting app initialization...');
        
        // Initialize cloud database
        console.log('Creating CloudDB...');
        cloudDb = new CloudDB(authManager);
        
        console.log('Initializing CloudDB...');
        await cloudDb.init();
        console.log('CloudDB initialized');

        // Create stock app instance if it doesn't exist
        if (!window.stockApp) {
            console.log('Creating StockApp instance...');
            window.stockApp = new StockApp(cloudDb, authManager);
            console.log('StockApp created');
        }
        
        // Initialize the app (this will render the UI)
        console.log('Initializing StockApp...');
        await window.stockApp.init();
        
        // Start session timeout
        authManager.startSessionTimeout();
        
        console.log('App initialized successfully!');
    } catch (error) {
        console.error('Failed to initialize app:', error);
        console.error('Error stack:', error.stack);
        alert('Failed to initialize app: ' + error.message + '\n\nCheck console for details.');
    }
}

function showLogin() {
    document.getElementById('login-form').classList.remove('hidden');
    document.getElementById('signup-form').classList.add('hidden');
    document.getElementById('forgot-form').classList.add('hidden');
    clearAuthMessage();
}

function showSignup() {
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('signup-form').classList.remove('hidden');
    document.getElementById('forgot-form').classList.add('hidden');
    clearAuthMessage();
}

function showForgotPassword() {
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('signup-form').classList.add('hidden');
    document.getElementById('forgot-form').classList.remove('hidden');
    clearAuthMessage();
}

function showAuthMessage(message, type) {
    const messageEl = document.getElementById('auth-message');
    if (messageEl) {
        messageEl.textContent = message;
        messageEl.className = `auth-message show ${type}`;
    }
}

function clearAuthMessage() {
    const messageEl = document.getElementById('auth-message');
    if (messageEl) {
        messageEl.className = 'auth-message';
    }
}
