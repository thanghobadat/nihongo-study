const http = require('http');

const body = {
  item_type: 'hiragana',
  item_id: 9999,
  status: '31'
};

const options = {
  hostname: 'localhost',
  port: 8080,
  path: '/api/user/progress',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer mock-token-user123'
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('Status code:', res.statusCode);
    console.log('Headers:', res.headers);
    console.log('Response body:', data);
  });
});

req.on('error', (err) => {
  console.error('Request error:', err);
});

req.write(JSON.stringify(body));
req.end();
