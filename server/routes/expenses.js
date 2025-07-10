import express from 'express'
import { authenticateToken } from '../middleware/auth.js'
import pool from '../db.js'

const router = express.Router()

// Get all expense claims
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT 
        ec.*,
        u.first_name || ' ' || u.last_name as employee_name
      FROM expense_claims ec
      LEFT JOIN users u ON ec.user_id = u.id
      WHERE ec.organization_id = $1
      ORDER BY ec.date DESC`,
      [req.user.organizationId]
    )
    res.json(result.rows)
  } catch (error) {
    next(error)
  }
})

// Get single expense claim
router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const claimResult = await pool.query(
      `SELECT 
        ec.*,
        u.first_name || ' ' || u.last_name as employee_name
      FROM expense_claims ec
      LEFT JOIN users u ON ec.user_id = u.id
      WHERE ec.id = $1 AND ec.organization_id = $2`,
      [req.params.id, req.user.organizationId]
    )

    if (claimResult.rows.length === 0) {
      return res.status(404).json({ message: 'Expense claim not found' })
    }

    const lineItemsResult = await pool.query(
      `SELECT 
        ecl.*,
        a.name as account_name,
        a.code as account_code
      FROM expense_claim_lines ecl
      LEFT JOIN accounts a ON ecl.account_id = a.id
      WHERE ecl.expense_claim_id = $1
      ORDER BY ecl.id`,
      [req.params.id]
    )

    const claim = claimResult.rows[0]
    claim.line_items = lineItemsResult.rows

    res.json(claim)
  } catch (error) {
    next(error)
  }
})

// Create expense claim
router.post('/', authenticateToken, async (req, res, next) => {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const {
      date,
      notes,
      line_items = []
    } = req.body

    // Generate claim number
    const claimNumberResult = await client.query(
      `SELECT COUNT(*) + 1 as next_number 
      FROM expense_claims 
      WHERE organization_id = $1 
      AND EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM CURRENT_DATE)`,
      [req.user.organizationId]
    )
    const claimNumber = `EXP-${new Date().getFullYear()}-${String(claimNumberResult.rows[0].next_number).padStart(4, '0')}`

    // Calculate total
    const totalAmount = line_items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0)

    // Create expense claim
    const claimResult = await client.query(
      `INSERT INTO expense_claims 
        (organization_id, claim_number, user_id, date, total_amount, status, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        req.user.organizationId,
        claimNumber,
        req.user.userId,
        date,
        totalAmount,
        'draft',
        notes
      ]
    )

    const claimId = claimResult.rows[0].id

    // Create line items
    for (const item of line_items) {
      await client.query(
        `INSERT INTO expense_claim_lines 
          (expense_claim_id, date, description, amount, account_id, receipt_url)
        VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          claimId,
          item.date || date,
          item.description,
          item.amount,
          item.account_id,
          item.receipt_url
        ]
      )
    }

    await client.query('COMMIT')

    // Fetch the complete claim with line items
    const result = await pool.query(
      `SELECT * FROM expense_claims WHERE id = $1`,
      [claimId]
    )

    res.status(201).json(result.rows[0])
  } catch (error) {
    await client.query('ROLLBACK')
    next(error)
  } finally {
    client.release()
  }
})

// Update expense claim
router.put('/:id', authenticateToken, async (req, res, next) => {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const {
      date,
      notes,
      line_items = []
    } = req.body

    // Check if claim exists and is editable
    const existingClaim = await client.query(
      `SELECT * FROM expense_claims 
      WHERE id = $1 AND organization_id = $2 AND status = 'draft'`,
      [req.params.id, req.user.organizationId]
    )

    if (existingClaim.rows.length === 0) {
      return res.status(404).json({ message: 'Expense claim not found or not editable' })
    }

    // Calculate total
    const totalAmount = line_items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0)

    // Update claim
    await client.query(
      `UPDATE expense_claims 
      SET date = $1, total_amount = $2, notes = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $4`,
      [date, totalAmount, notes, req.params.id]
    )

    // Delete existing line items
    await client.query(
      'DELETE FROM expense_claim_lines WHERE expense_claim_id = $1',
      [req.params.id]
    )

    // Create new line items
    for (const item of line_items) {
      await client.query(
        `INSERT INTO expense_claim_lines 
          (expense_claim_id, date, description, amount, account_id, receipt_url)
        VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          req.params.id,
          item.date || date,
          item.description,
          item.amount,
          item.account_id,
          item.receipt_url
        ]
      )
    }

    await client.query('COMMIT')

    // Fetch updated claim
    const result = await pool.query(
      `SELECT * FROM expense_claims WHERE id = $1`,
      [req.params.id]
    )

    res.json(result.rows[0])
  } catch (error) {
    await client.query('ROLLBACK')
    next(error)
  } finally {
    client.release()
  }
})

// Delete expense claim
router.delete('/:id', authenticateToken, async (req, res, next) => {
  try {
    const result = await pool.query(
      `DELETE FROM expense_claims 
      WHERE id = $1 AND organization_id = $2 AND status = 'draft'
      RETURNING id`,
      [req.params.id, req.user.organizationId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Expense claim not found or not deletable' })
    }

    res.json({ message: 'Expense claim deleted successfully' })
  } catch (error) {
    next(error)
  }
})

// Submit expense claim for approval
router.post('/:id/submit', authenticateToken, async (req, res, next) => {
  try {
    const result = await pool.query(
      `UPDATE expense_claims 
      SET status = 'submitted', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND organization_id = $2 AND status = 'draft'
      RETURNING *`,
      [req.params.id, req.user.organizationId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Expense claim not found or already submitted' })
    }

    res.json(result.rows[0])
  } catch (error) {
    next(error)
  }
})

// Approve expense claim
router.post('/:id/approve', authenticateToken, async (req, res, next) => {
  try {
    const result = await pool.query(
      `UPDATE expense_claims 
      SET status = 'approved', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND organization_id = $2 AND status = 'submitted'
      RETURNING *`,
      [req.params.id, req.user.organizationId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Expense claim not found or not in submitted status' })
    }

    res.json(result.rows[0])
  } catch (error) {
    next(error)
  }
})

// Reject expense claim
router.post('/:id/reject', authenticateToken, async (req, res, next) => {
  try {
    const result = await pool.query(
      `UPDATE expense_claims 
      SET status = 'rejected', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND organization_id = $2 AND status = 'submitted'
      RETURNING *`,
      [req.params.id, req.user.organizationId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Expense claim not found or not in submitted status' })
    }

    res.json(result.rows[0])
  } catch (error) {
    next(error)
  }
})

export default router