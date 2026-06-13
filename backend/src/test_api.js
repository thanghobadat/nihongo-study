// Set test environment
process.env.NODE_ENV = 'test';
process.env.PORT = 8081;

const app = require('./index');
const http = require('http');

const PORT = 8081;
let server;

// Start server
server = app.listen(PORT, async () => {
  console.log(`Test server running on port ${PORT}`);
  
  try {
    await runTests();
    console.log('\n✅ All integration routing tests passed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Integration tests failed:', error);
    process.exit(1);
  } finally {
    server.close();
  }
});

// Helper to make HTTP requests
function makeRequest(path, method = 'GET', headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: PORT,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            body: data ? JSON.parse(data) : null
          });
        } catch (e) {
          resolve({ statusCode: res.statusCode, rawBody: data });
        }
      });
    });

    req.on('error', (err) => reject(err));
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

// Test Suite
async function runTests() {
  console.log('Running tests...');

  // Test 1: Public Root Endpoint
  const r1 = await makeRequest('/');
  console.log('1. GET / -> Status:', r1.statusCode);
  if (r1.statusCode !== 200 || !r1.body.message.includes('Nihongo Flow')) {
    throw new Error('Test 1 failed: Root endpoint did not return welcome message.');
  }

  // Test 2: Public Health Check
  const r2 = await makeRequest('/api/health');
  console.log('2. GET /api/health -> Status:', r2.statusCode);
  if (r2.statusCode !== 200 || r2.body.status !== 'ok') {
    throw new Error('Test 2 failed: Health endpoint failed.');
  }

  // Test 3: Unauthorized Access (No Token)
  const r3 = await makeRequest('/api/user/target-plan');
  console.log('3. GET /api/user/target-plan (No Token) -> Status:', r3.statusCode);
  if (r3.statusCode !== 401 || !r3.body.error.includes('Missing or invalid token')) {
    throw new Error('Test 3 failed: Did not reject unauthorized access.');
  }

  // Test 4: Forbidden Access (User Token to Admin API)
  const r4 = await makeRequest('/api/admin/students', 'GET', {
    'Authorization': 'Bearer mock-token-user123'
  });
  console.log('4. GET /api/admin/students (User Token) -> Status:', r4.statusCode);
  if (r4.statusCode !== 403 || !r4.body.error.includes('Admin access required')) {
    throw new Error('Test 4 failed: Did not forbid regular user from admin route.');
  }

  // Test 5: Authorized Admin Middleware Check (Passes auth, hits database error)
  const r5 = await makeRequest('/api/admin/students', 'GET', {
    'Authorization': 'Bearer mock-token-admin123-admin'
  });
  console.log('5. GET /api/admin/students (Admin Token) -> Status:', r5.statusCode);
  // Status should be 500 (since Supabase is not configured and fails to fetch, but NOT 403)
  if (r5.statusCode !== 500) {
    throw new Error(`Test 5 failed: Expected database error (500), but got status: ${r5.statusCode}`);
  }
}
