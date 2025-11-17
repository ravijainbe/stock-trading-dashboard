// Configuration file for Stock Trading Dashboard
// Update these values with your actual credentials

const CONFIG = {
    // Supabase Configuration
    supabase: {
        url: 'https://gccjgjulqjzagxuffzqj.supabase.co',
        anonKey: 'YOUR_SUPABASE_ANON_KEY' // Get from Supabase Settings → API → Project API keys → anon public
    },

    // Backend API Configuration
    backend: {
        url: 'http://localhost:3000', // Change to your deployed backend URL in production
        // Production example: 'https://your-app.herokuapp.com'
    },

    // App Configuration
    app: {
        name: 'Stock Trading Dashboard',
        version: '1.0.0'
    }
};

// Export for use in other files
window.CONFIG = CONFIG;
