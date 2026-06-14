const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function run() {
  const schemaPath = path.join(__dirname, '../src/db/schema.sql');
  console.log(`Reading SQL schema from: ${schemaPath}`);
  const sql = fs.readFileSync(schemaPath, 'utf8');

  // Supabase PostgreSQL Connection Configurations
  const client = new Client({
    host: 'db.bwkpcxpidtjqfyztvcly.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'R5egGM2W4EUnE%',
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('Connecting to Supabase PostgreSQL database...');
    await client.connect();
    console.log('Connected successfully! Executing schema.sql...');

    // Run the schema query
    await client.query(sql);
    console.log('🎉 Schema created successfully in Supabase!');
  } catch (error) {
    console.error('❌ Error executing schema:', error.message);
  } finally {
    await client.end();
  }
}

run();
