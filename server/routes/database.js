import express from 'express'
import { authenticateToken } from '../middleware/auth.js'
import pool from '../config/database.js'

const router = express.Router()

// Get all tables with metadata
router.get('/tables', authenticateToken, async (req, res, next) => {
  try {
    // Get all tables in the database
    const tablesQuery = `
      SELECT 
        schemaname,
        tablename,
        tableowner,
        hasindexes,
        hastriggers
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `
    
    const tablesResult = await pool.query(tablesQuery)
    const tables = tablesResult.rows

    // Get row counts for each table
    const tableStats = await Promise.all(
      tables.map(async (table) => {
        try {
          const countQuery = `SELECT COUNT(*) as row_count FROM ${table.tablename}`
          const countResult = await pool.query(countQuery)
          
          // Get table size
          const sizeQuery = `
            SELECT pg_size_pretty(pg_total_relation_size($1::regclass)) as size
          `
          const sizeResult = await pool.query(sizeQuery, [table.tablename])
          
          return {
            ...table,
            row_count: parseInt(countResult.rows[0].row_count),
            size: sizeResult.rows[0].size
          }
        } catch (error) {
          console.error(`Error getting stats for table ${table.tablename}:`, error)
          return {
            ...table,
            row_count: 0,
            size: '0 bytes'
          }
        }
      })
    )

    res.json(tableStats)
  } catch (error) {
    next(error)
  }
})

// Get table structure (columns, constraints, indexes)
router.get('/tables/:tableName/structure', authenticateToken, async (req, res, next) => {
  try {
    const { tableName } = req.params

    // Get columns
    const columnsQuery = `
      SELECT 
        column_name,
        data_type,
        character_maximum_length,
        is_nullable,
        column_default,
        ordinal_position
      FROM information_schema.columns
      WHERE table_schema = 'public' 
        AND table_name = $1
      ORDER BY ordinal_position
    `
    const columnsResult = await pool.query(columnsQuery, [tableName])

    // Get constraints
    const constraintsQuery = `
      SELECT 
        conname as constraint_name,
        contype as constraint_type,
        pg_get_constraintdef(oid) as definition
      FROM pg_constraint
      WHERE conrelid = $1::regclass
    `
    const constraintsResult = await pool.query(constraintsQuery, [tableName])

    // Get indexes
    const indexesQuery = `
      SELECT 
        indexname,
        indexdef
      FROM pg_indexes
      WHERE schemaname = 'public' 
        AND tablename = $1
    `
    const indexesResult = await pool.query(indexesQuery, [tableName])

    // Get foreign keys with referenced tables
    const foreignKeysQuery = `
      SELECT
        tc.constraint_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND tc.table_name = $1
    `
    const foreignKeysResult = await pool.query(foreignKeysQuery, [tableName])

    res.json({
      table_name: tableName,
      columns: columnsResult.rows,
      constraints: constraintsResult.rows,
      indexes: indexesResult.rows,
      foreign_keys: foreignKeysResult.rows
    })
  } catch (error) {
    next(error)
  }
})

// Browse table data with pagination
router.get('/tables/:tableName/data', authenticateToken, async (req, res, next) => {
  try {
    const { tableName } = req.params
    const { 
      page = 1, 
      limit = 50, 
      sortBy = null, 
      sortOrder = 'ASC',
      filter = null 
    } = req.query

    const offset = (page - 1) * limit

    // Build query with optional sorting and filtering
    let query = `SELECT * FROM ${tableName}`
    const queryParams = []
    
    if (filter) {
      // Simple text search across all text columns
      query += ` WHERE CAST(${tableName} AS TEXT) ILIKE $1`
      queryParams.push(`%${filter}%`)
    }

    if (sortBy) {
      query += ` ORDER BY ${sortBy} ${sortOrder}`
    }

    query += ` LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`
    queryParams.push(limit, offset)

    // Get total count
    const countQuery = filter 
      ? `SELECT COUNT(*) FROM ${tableName} WHERE CAST(${tableName} AS TEXT) ILIKE $1`
      : `SELECT COUNT(*) FROM ${tableName}`
    
    const countParams = filter ? [`%${filter}%`] : []
    const countResult = await pool.query(countQuery, countParams)
    const totalRows = parseInt(countResult.rows[0].count)

    // Get data
    const dataResult = await pool.query(query, queryParams)

    res.json({
      data: dataResult.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total_rows: totalRows,
        total_pages: Math.ceil(totalRows / limit)
      }
    })
  } catch (error) {
    next(error)
  }
})

// Execute SQL query
router.post('/query', authenticateToken, async (req, res, next) => {
  try {
    const { query, params = [] } = req.body

    // Basic SQL injection prevention - only allow SELECT queries
    const normalizedQuery = query.trim().toUpperCase()
    if (!normalizedQuery.startsWith('SELECT') && !normalizedQuery.startsWith('WITH')) {
      return res.status(403).json({ 
        error: 'Only SELECT queries are allowed' 
      })
    }

    const startTime = Date.now()
    const result = await pool.query(query, params)
    const executionTime = Date.now() - startTime

    res.json({
      rows: result.rows,
      row_count: result.rowCount,
      fields: result.fields.map(f => ({
        name: f.name,
        dataTypeID: f.dataTypeID
      })),
      execution_time_ms: executionTime
    })
  } catch (error) {
    res.status(400).json({ 
      error: error.message,
      position: error.position,
      hint: error.hint
    })
  }
})

// Get table relationships for ERD
router.get('/relationships', authenticateToken, async (req, res, next) => {
  try {
    const query = `
      SELECT
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name,
        tc.constraint_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
      ORDER BY tc.table_name
    `
    
    const result = await pool.query(query)
    
    // Group relationships by table
    const relationships = result.rows.reduce((acc, row) => {
      if (!acc[row.table_name]) {
        acc[row.table_name] = []
      }
      acc[row.table_name].push({
        column: row.column_name,
        references: {
          table: row.foreign_table_name,
          column: row.foreign_column_name
        },
        constraint_name: row.constraint_name
      })
      return acc
    }, {})

    res.json(relationships)
  } catch (error) {
    next(error)
  }
})

// Get database statistics
router.get('/statistics', authenticateToken, async (req, res, next) => {
  try {
    // Database size
    const dbSizeQuery = `
      SELECT pg_database_size(current_database()) as size,
             pg_size_pretty(pg_database_size(current_database())) as size_pretty
    `
    const dbSizeResult = await pool.query(dbSizeQuery)

    // Table statistics
    const tableStatsQuery = `
      SELECT 
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
        n_live_tup as row_count,
        n_dead_tup as dead_rows,
        last_vacuum,
        last_autovacuum
      FROM pg_stat_user_tables
      WHERE schemaname = 'public'
      ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
      LIMIT 10
    `
    const tableStatsResult = await pool.query(tableStatsQuery)

    // Connection stats
    const connectionStatsQuery = `
      SELECT 
        COUNT(*) as total_connections,
        COUNT(*) FILTER (WHERE state = 'active') as active_connections,
        COUNT(*) FILTER (WHERE state = 'idle') as idle_connections
      FROM pg_stat_activity
    `
    const connectionStatsResult = await pool.query(connectionStatsQuery)

    res.json({
      database: {
        size: dbSizeResult.rows[0].size,
        size_pretty: dbSizeResult.rows[0].size_pretty
      },
      largest_tables: tableStatsResult.rows,
      connections: connectionStatsResult.rows[0]
    })
  } catch (error) {
    next(error)
  }
})

// Get migration history
router.get('/migrations', authenticateToken, async (req, res, next) => {
  try {
    // Check if migrations table exists
    const checkTableQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'schema_migrations'
      )
    `
    const tableExists = await pool.query(checkTableQuery)
    
    if (!tableExists.rows[0].exists) {
      return res.json({ migrations: [], message: 'No migrations table found' })
    }

    // Get migration history
    const migrationsQuery = `
      SELECT * FROM schema_migrations 
      ORDER BY executed_at DESC
    `
    const result = await pool.query(migrationsQuery)

    res.json({ migrations: result.rows })
  } catch (error) {
    next(error)
  }
})

export default router