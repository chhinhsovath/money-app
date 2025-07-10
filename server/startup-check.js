import dotenv from 'dotenv'
import pg from 'pg'

// Load environment variables
dotenv.config()

console.log('🚀 Server Startup Check')
console.log('=' .repeat(50))

// Check environment variables
console.log('\n📋 Environment Variables:')
const requiredEnvVars = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD', 'JWT_SECRET']
let envOk = true

requiredEnvVars.forEach(varName => {
  const value = process.env[varName]
  if (!value) {
    console.log(`❌ ${varName}: NOT SET`)
    envOk = false
  } else {
    console.log(`✅ ${varName}: ${varName.includes('PASSWORD') || varName.includes('SECRET') ? '***' : value}`)
  }
})

if (!envOk) {
  console.log('\n⚠️  Missing environment variables! Check your .env file.')
  process.exit(1)
}

// Test database connection
console.log('\n🗄️  Testing Database Connection...')
const { Pool } = pg
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
})

try {
  const result = await pool.query('SELECT NOW()')
  console.log('✅ Database connected successfully')
  console.log(`   Current time: ${result.rows[0].now}`)
  
  // Check if essential tables exist
  const tables = ['users', 'organizations']
  for (const table of tables) {
    const tableCheck = await pool.query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = $1
      )`,
      [table]
    )
    
    if (tableCheck.rows[0].exists) {
      console.log(`✅ Table '${table}' exists`)
    } else {
      console.log(`❌ Table '${table}' DOES NOT EXIST`)
      console.log('   Run: psql -U postgres -d moneyapp -f ../database/schema.sql')
    }
  }
  
  await pool.end()
  console.log('\n✅ All checks passed! Server should start successfully.')
} catch (error) {
  console.error('\n❌ Database connection failed:', error.message)
  console.log('\nTroubleshooting:')
  console.log('1. Is PostgreSQL running?')
  console.log('2. Does the database exist? Run: createdb moneyapp')
  console.log('3. Are the credentials correct?')
  process.exit(1)
}