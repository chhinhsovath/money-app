import express from 'express'
import { authenticateToken } from '../middleware/auth.js'
import pool from '../db.js'

const router = express.Router()

// Get all accounts
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const { type } = req.query
    let query = 'SELECT * FROM accounts WHERE organization_id = $1'
    const params = [req.user.organizationId]
    
    if (type) {
      query += ' AND type = $2'
      params.push(type)
    }
    
    query += ' ORDER BY code'
    
    const result = await pool.query(query, params)
    res.json(result.rows)
  } catch (error) {
    next(error)
  }
})

// Get revenue accounts (for invoices)
router.get('/revenue', authenticateToken, async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT * FROM accounts 
       WHERE organization_id = $1 
       AND type IN ('revenue', 'other_income')
       AND is_active = true
       ORDER BY code`,
      [req.user.organizationId]
    )
    res.json(result.rows)
  } catch (error) {
    next(error)
  }
})

// Get expense accounts (for bills)
router.get('/expense', authenticateToken, async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT * FROM accounts 
       WHERE organization_id = $1 
       AND type IN ('expense', 'cost_of_goods_sold', 'other_expense')
       AND is_active = true
       ORDER BY code`,
      [req.user.organizationId]
    )
    res.json(result.rows)
  } catch (error) {
    next(error)
  }
})

export default router