const supabase = require('../src/db/supabase');

async function test() {
  try {
    console.log('Testing connection to Supabase...');
    const { data, error } = await supabase.from('lessons').select('*').limit(1);
    if (error) {
      console.error('Error fetching lessons:', error.message);
    } else {
      console.log('Successfully connected! Data:', data);
    }
  } catch (err) {
    console.error('Catch error:', err.message);
  }
}

test();
