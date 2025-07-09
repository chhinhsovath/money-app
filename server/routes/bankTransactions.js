import express from 'express'
import { authenticateToken } from '../middleware/auth.js'
import pool from '../db.js'

const router = express.Router()

// Get all transactions (with filters)
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const { 
      bank_account_id, 
      start_date, 
      end_date, 
      is_reconciled,
      search 
    } = req.query

    let query = `
      SELECT 
        bt.*,
        c.name as contact_name,
        a.name as account_name,
        a.code as account_code
      FROM bank_transactions bt
      LEFT JOIN contacts c ON bt.contact_id = c.id
      LEFT JOIN accounts a ON bt.bank_account_id = a.id
      WHERE bt.organization_id = $1
    `
    const params = [req.user.organizationId]
    let paramIndex = 2

    if (bank_account_id) {
      query += ` AND bt.bank_account_id = $${paramIndex}`
      params.push(bank_account_id)
      paramIndex++
    }

    if (start_date) {
      query += ` AND bt.date >= $${paramIndex}`
      params.push(start_date)
      paramIndex++
    }

    if (end_date) {
      query += ` AND bt.date <= $${paramIndex}`
      params.push(end_date)
      paramIndex++
    }

    if (is_reconciled !== undefined) {
      query += ` AND bt.is_reconciled = $${paramIndex}`
      params.push(is_reconciled === 'true')
      paramIndex++
    }

    if (search) {
      query += ` AND (
        bt.description ILIKE $${paramIndex} OR 
        bt.reference ILIKE $${paramIndex} OR
        bt.payee ILIKE $${paramIndex}
      )`
      params.push(`%${search}%`)
      paramIndex++
    }

    query += ' ORDER BY bt.date DESC, bt.created_at DESC'

    const result = await pool.query(query, params)
    res.json(result.rows)
  } catch (error) {
    next(error)
  }
})

// Get single transaction
router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT 
        bt.*,
        c.name as contact_name,
        a.name as account_name,
        a.code as account_code
      FROM bank_transactions bt
      LEFT JOIN contacts c ON bt.contact_id = c.id
      LEFT JOIN accounts a ON bt.bank_account_id = a.id
      WHERE bt.id = $1 AND bt.organization_id = $2`,
      [req.params.id, req.user.organizationId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Transaction not found' })
    }

    res.json(result.rows[0])
  } catch (error) {
    next(error)
  }
})

// Create transaction
router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const {
      bank_account_id,
      date,
      amount,
      type,
      description,
      reference,
      payee,
      contact_id
    } = req.body

    const result = await pool.query(
      `INSERT INTO bank_transactions 
        (organization_id, bank_account_id, date, amount, type, 
         description, reference, payee, contact_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        req.user.organizationId,
        bank_account_id,
        date,
        amount,
        type,
        description,
        reference,
        payee,
        contact_id
      ]
    )

    res.status(201).json(result.rows[0])
  } catch (error) {
    next(error)
  }
})

// Update transaction
router.put('/:id', authenticateToken, async (req, res, next) => {
  try {
    const {
      date,
      amount,
      type,
      description,
      reference,
      payee,
      contact_id,
      is_reconciled
    } = req.body

    const result = await pool.query(
      `UPDATE bank_transactions 
      SET date = $1, amount = $2, type = $3, description = $4,
          reference = $5, payee = $6, contact_id = $7, is_reconciled = $8,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $9 AND organization_id = $10
      RETURNING *`,
      [
        date,
        amount,
        type,
        description,
        reference,
        payee,
        contact_id,
        is_reconciled,
        req.params.id,
        req.user.organizationId
      ]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Transaction not found' })
    }

    res.json(result.rows[0])
  } catch (error) {
    next(error)
  }
})

// Delete transaction
router.delete('/:id', authenticateToken, async (req, res, next) => {
  try {
    const result = await pool.query(
      'DELETE FROM bank_transactions WHERE id = $1 AND organization_id = $2 RETURNING id',
      [req.params.id, req.user.organizationId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Transaction not found' })
    }

    res.json({ message: 'Transaction deleted successfully' })
  } catch (error) {
    next(error)
  }
})

// Bulk reconcile transactions
router.post('/reconcile', authenticateToken, async (req, res, next) => {
  try {
    const { transaction_ids, is_reconciled } = req.body

    if (!Array.isArray(transaction_ids) || transaction_ids.length === 0) {
      return res.status(400).json({ message: 'No transactions provided' })
    }

    const result = await pool.query(
      `UPDATE bank_transactions 
      SET is_reconciled = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = ANY($2) AND organization_id = $3
      RETURNING id`,
      [is_reconciled, transaction_ids, req.user.organizationId]
    )

    res.json({ 
      message: `${result.rowCount} transactions updated`,
      updated: result.rows.map(r => r.id)
    })
  } catch (error) {
    next(error)
  }
})

export default router