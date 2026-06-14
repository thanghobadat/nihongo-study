const https = require('https');

function getAPI(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'nihongo-flow-backend.onrender.com',
      port: 443,
      path: path,
      method: 'GET',
      headers: {
        'Authorization': 'Bearer mock-token-testuser'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          body: JSON.parse(data)
        });
      });
    });

    req.on('error', (err) => reject(err));
    req.end();
  });
}

async function test() {
  try {
    console.log('Fetching lessons from production backend...');
    const lessons = await getAPI('/api/user/lessons');
    console.log('Lessons status:', lessons.status);
    console.log('Lessons count:', lessons.body.length);
    if (lessons.body.length > 0) {
      console.log('Sample lesson:', lessons.body[0]);
    }

    console.log('\nFetching Lesson 1 vocabulary from production backend...');
    const vocab = await getAPI('/api/user/lessons/1/vocabulary');
    console.log('Vocab status:', vocab.status);
    console.log('Vocab count:', vocab.body.length);
    if (vocab.body.length > 0) {
      console.log('Sample vocab:', vocab.body[0]);
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

test();
