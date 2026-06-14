// Polyfill WebSocket for Node.js < 22 (required by Supabase Realtime)
global.WebSocket = require('ws');

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('WARNING: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing from environment variables.');
}

// Client for database operations (headers will never be mutated because we don't call auth methods on it)
const dbClient = createClient(supabaseUrl || '', supabaseServiceKey || '', {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

// Client for auth operations (mutates headers when verifying tokens, isolating mutation from dbClient)
const authClient = createClient(supabaseUrl || '', supabaseServiceKey || '', {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

// Proxy auth property to redirect all auth calls to the authClient
Object.defineProperty(dbClient, 'auth', {
  get() {
    return authClient.auth;
  }
});

module.exports = dbClient;
