import express from 'express'
import { authenticateToken } from '../middleware/auth.js'
import pool from '../db.js'

const router = express.Router()

// Get all bank accounts
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT 
        a.*,
        COALESCE(
          (SELECT SUM(
            CASE 
              WHEN bt.type = 'credit' THEN bt.amount
              WHEN bt.type = 'debit' THEN -bt.amount
            END
          ) FROM bank_transactions bt WHERE bt.bank_account_id = a.id),
          0
        ) as current_balance
      FROM accounts a
      WHERE a.organization_id = $1 
        AND a.type = 'asset'
        AND a.code LIKE '11%'
      ORDER BY a.code`,
      [req.user.organizationId]
    )
    res.json(result.rows)
  } catch (error) {
    next(error)
  }
})

// Get single bank account with transactions
router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const accountResult = await pool.query(
      `SELECT 
        a.*,
        COALESCE(
          (SELECT SUM(
            CASE 
              WHEN bt.type = 'credit' THEN bt.amount
              WHEN bt.type = 'debit' THEN -bt.amount
            END
          ) FROM bank_transactions bt WHERE bt.bank_account_id = a.id),
          0
        ) as current_balance
      FROM accounts a
      WHERE a.id = $1 AND a.organization_id = $2`,
      [req.params.id, req.user.organizationId]
    )

    if (accountResult.rows.length === 0) {
      return res.status(404).json({ message: 'Bank account not found' })
    }

    const transactionsResult = await pool.query(
      `SELECT 
        bt.*,
        c.name as contact_name
      FROM bank_transactions bt
      LEFT JOIN contacts c ON bt.contact_id = c.id
      WHERE bt.bank_account_id = $1
      ORDER BY bt.date DESC, bt.created_at DESC
      LIMIT 100`,
      [req.params.id]
    )

    const account = accountResult.rows[0]
    account.transactions = transactionsResult.rows

    res.json(account)
  } catch (error) {
    next(error)
  }
})

// Create bank account
router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const {
      code,
      name,
      account_number,
      bank_name,
      description,
      opening_balance = 0
    } = req.body

    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      // Create the account
      const accountResult = await client.query(
        `INSERT INTO accounts 
          (organization_id, code, name, type, description, is_active)
        VALUES ($1, $2, $3, $4, $5, true)
        RETURNING *`,
        [
          req.user.organizationId,
          code,
          name,
          'asset',
          description || `${bank_name} - ${account_number}`
        ]
      )

      const account = accountResult.rows[0]

      // Add opening balance transaction if specified
      if (opening_balance !== 0) {
        await client.query(
          `INSERT INTO bank_transactions 
            (organization_id, bank_account_id, date, amount, type, description, is_reconciled)
          VALUES ($1, $2, CURRENT_DATE, $3, $4, $5, true)`,
          [
            req.user.organizationId,
            account.id,
            Math.abs(opening_balance),
            opening_balance >= 0 ? 'credit' : 'debit',
            'Opening Balance'
          ]
        )
      }

      await client.query('COMMIT')
      res.status(201).json(account)
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  } catch (error) {
    next(error)
  }
})

// Update bank account
router.put('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { name, description, is_active } = req.body

    const result = await pool.query(
      `UPDATE accounts 
      SET name = $1, description = $2, is_active = $3,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $4 AND organization_id = $5
      RETURNING *`,
      [name, description, is_active, req.params.id, req.user.organizationId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Bank account not found' })
    }

    res.json(result.rows[0])
  } catch (error) {
    next(error)
  }
})

export default router