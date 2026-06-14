const https = require('https');
global.WebSocket = require('ws');
const { createClient } = require('@supabase/supabase-js');

// Initialize local Supabase client with production keys
const supabaseUrl = 'https://placeholder-project.supabase.co';
const supabaseKey = 'placeholder-key';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  try {
    console.log('Logging in to Supabase Auth using test credentials...');
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'ai_test_deploy@gmail.com',
      password: 'TestPassword123!'
    });

    if (error) {
      console.error('Supabase Login error:', error.message);
      return;
    }

    const token = data.session.access_token;
    console.log('Login successful! Token retrieved:', token.substring(0, 30) + '...');

    // Request lessons from production Render backend
    console.log('Sending request to Render /api/user/lessons...');
    const options = {
      hostname: 'nihongo-flow-backend.onrender.com',
      port: 443,
      path: '/api/user/lessons',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    const req = https.request(options, (res) => {
      let responseBody = '';
      console.log('Status code from Render:', res.statusCode);
      res.on('data', (chunk) => responseBody += chunk);
      res.on('end', () => {
        console.log('Response body:', responseBody);
      });
    });

    req.on('error', (err) => {
      console.error('Request error:', err.message);
    });

    req.end();

  } catch (err) {
    console.error('Catch error:', err.message);
  }
}

test();
