import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

/**
 * Global Database Query Helper
 * @param {string} text 
 * @param {any[]} params 
 */
export const query = (text, params) => pool.query(text, params);

/**
 * Get Client for Transactions
 */
export const getClient = () => pool.connect();

export default pool;
