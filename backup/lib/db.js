import { Pool } from '@vercel/postgres'

// Create a connection pool for Vercel Postgres
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
})

export default pool

// Helper function for queries
export async function query(text, params) {
  const client = await pool.connect()
  try {
    const result = await client.query(text, params)
    return result
  } finally {
    client.release()
  }
}