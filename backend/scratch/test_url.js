const https = require('https');

https.get('https://nihongo-flow-backend.onrender.com/api/health', (res) => {
  let data = '';
  console.log('Status code:', res.statusCode);
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => console.log('Response:', data));
}).on('error', (err) => console.error('Error:', err.message));
