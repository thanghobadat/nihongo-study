const { Client } = require('pg');

async function check() {
  const client = new Client({
    host: 'db.bwkpcxpidtjqfyztvcly.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'placeholder-db-password',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to database. Checking row counts...');

    const tables = ['lessons', 'vocabulary', 'kanji', 'grammar', 'kaiwa_dialog', 'profiles', 'user_progress', 'target_plans'];
    for (const table of tables) {
      const res = await client.query(`SELECT COUNT(*) FROM public.${table}`);
      console.log(`Table ${table}: ${res.rows[0].count} rows`);
    }
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}

check();
