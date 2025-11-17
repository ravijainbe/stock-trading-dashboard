// Authentication Manager with Supabase
class AuthManager {
    constructor() {
        this.supabaseUrl = 'https://gccjgjulqjzagxuffzqj.supabase.co';
        this.supabaseKey = 'YOUR_SUPABASE_ANON_KEY'; // TODO: Add your anon key from Supabase Settings → API
        this.supabase = null;
        this.currentUser = null;
    }

    async init() {
        // Check if Supabase is configured
        if (this.supabaseUrl.includes('YOUR_SUPABASE')) {
            console.warn('Supabase not configured. Authentication disabled.');
            return;
        }

        // Initialize Supabase client
        this.supabase = supabase.createClient(this.supabaseUrl, this.supabaseKey);

        // Check for existing session
        const { data: { session } } = await this.supabase.auth.getSession();
        if (session) {
            this.currentUser = session.user;
            console.log('User session restored:', this.currentUser.email);
        }

        // Listen for auth state changes
        this.supabase.auth.onAuthStateChange((event, session) => {
            console.log('Auth state changed:', event);
            if (session) {
                this.currentUser = session.user;
            } else {
                this.currentUser = null;
            }
            this.updateUI();
        });
    }

    async signUp(email, password, name, role = 'user') {
        if (!this.supabase) {
            return { success: false, error: 'Authentication not configured' };
        }

        try {
            const { data, error } = await this.supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        name: name,
                        role: role
                    }
                }
            });

            if (error) throw error;

            return { success: true, user: data.user };
        } catch (error) {
            console.error('Sign up error:', error);
            return { success: false, error: error.message };
        }
    }

    async signIn(email, password) {
        if (!this.supabase) {
            return { success: false, error: 'Authentication not configured' };
        }

        try {
            const { data, error } = await this.supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            this.currentUser = data.user;
            console.log('User signed in:', data.user.email);
            console.log('User metadata:', data.user.user_metadata);
            
            return { success: true, user: data.user };
        } catch (error) {
            console.error('Sign in error:', error);
            return { success: false, error: error.message };
        }
    }

    async signOut() {
        if (!this.supabase) {
            return { success: false, error: 'Authentication not configured' };
        }

        try {
            const { error } = await this.supabase.auth.signOut();
            if (error) throw error;

            this.currentUser = null;
            console.log('User signed out');
            
            return { success: true };
        } catch (error) {
            console.error('Sign out error:', error);
            return { success: false, error: error.message };
        }
    }

    async resetPassword(email) {
        if (!this.supabase) {
            return { success: false, error: 'Authentication not configured' };
        }

        try {
            const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin + '/reset-password'
            });

            if (error) throw error;

            return { success: true };
        } catch (error) {
            console.error('Password reset error:', error);
            return { success: false, error: error.message };
        }
    }

    isAuthenticated() {
        return this.currentUser !== null;
    }

    getUserId() {
        return this.currentUser?.id || null;
    }

    getUserEmail() {
        return this.currentUser?.email || null;
    }

    getUserName() {
        return this.currentUser?.user_metadata?.name || 
               this.currentUser?.email?.split('@')[0] || 
               'User';
    }

    getUserRole() {
        return this.currentUser?.user_metadata?.role || 'user';
    }

    isAdmin() {
        return this.getUserRole() === 'admin';
    }

    updateUI() {
        const authContainer = document.getElementById('auth-container');
        const appContainer = document.getElementById('app-container');

        if (this.isAuthenticated()) {
            // Hide auth, show app
            if (authContainer) authContainer.classList.add('hidden');
            if (appContainer) appContainer.classList.remove('hidden');

            // Update user name
            const userName = document.getElementById('user-name');
            if (userName) {
                userName.textContent = this.getUserName();
            }

            // Show/hide admin-only elements
            const adminElements = document.querySelectorAll('.admin-only');
            adminElements.forEach(el => {
                if (this.isAdmin()) {
                    el.classList.remove('hidden');
                } else {
                    el.classList.add('hidden');
                }
            });
        } else {
            // Show auth, hide app
            if (authContainer) authContainer.classList.remove('hidden');
            if (appContainer) appContainer.classList.add('hidden');
        }
    }

    // Session timeout management
    startSessionTimeout() {
        const TIMEOUT_DURATION = 30 * 60 * 1000; // 30 minutes
        let timeoutId;

        const resetTimeout = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(async () => {
                console.log('Session timeout - logging out');
                await this.signOut();
                alert('Your session has expired. Please log in again.');
            }, TIMEOUT_DURATION);
        };

        // Reset timeout on user activity
        ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(event => {
            document.addEventListener(event, resetTimeout, true);
        });

        // Start initial timeout
        resetTimeout();
    }
}

// Export for use in app
window.AuthManager = AuthManager;
