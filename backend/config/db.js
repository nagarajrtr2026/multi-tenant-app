const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'taskmanager',
});

const initDb = async () => {
  try {
    const schemaSql = fs.readFileSync(path.join(__dirname, '../models/schema.sql'), 'utf-8');
    await pool.query(schemaSql);
    console.log('Database schema initialized.');
  } catch (error) {
    if (error.code === '3D000') {
      console.error('Database does not exist! Please create the database first.');
    } else {
      console.error('Error initializing database schema:', error);
    }
  }
};

module.exports = { pool, initDb };
