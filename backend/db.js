import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres.mcodtxvayfunqzztvpjf:Bhush%40252003@aws-0-ap-south-1.pooler.supabase.com:6543/postgres";

export const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
});

export const query = (text, params) => pool.query(text, params);

export default {
  pool,
  query
};
