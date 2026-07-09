// Crée automatiquement la table "fiches" si elle n'existe pas encore.
// Lancer avec : npm run initdb

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    })
  : new Pool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });

async function main() {
  const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  try {
    await pool.query(sql);
    console.log('✔ Base de données prête : la table "fiches" existe.');
  } catch (err) {
    console.error('✘ Erreur lors de la création de la table :', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();
