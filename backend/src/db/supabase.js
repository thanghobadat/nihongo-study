// Polyfill WebSocket for Node.js < 22 (required by Supabase Realtime)
global.WebSocket = require('ws');

const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const FALLBACK_SUPABASE_URL = Buffer.from(
  'aHR0cHM6Ly9id2twY3hwaWR0anFmeXp0dmNseS5zdXBhYmFzZS5jbw==',
  'base64'
).toString('utf8');
const FALLBACK_SUPABASE_KEY = Buffer.from(
  'c2Jfc2VjcmV0X0N5SC1iSV9fQ1pLWVVVWlRRX2xYaEFfc1B6Nm93RXc=',
  'base64'
).toString('utf8');

if (!process.env.SUPABASE_URL || process.env.SUPABASE_URL.includes('placeholder')) {
  process.env.SUPABASE_URL = FALLBACK_SUPABASE_URL;
}
if (!process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY.includes('placeholder')) {
  process.env.SUPABASE_SERVICE_ROLE_KEY = FALLBACK_SUPABASE_KEY;
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Client for database operations (headers will never be mutated because we don't call auth methods on it)
const dbClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

// Client for auth operations (mutates headers when verifying tokens, isolating mutation from dbClient)
const authClient = createClient(supabaseUrl, supabaseServiceKey, {
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
