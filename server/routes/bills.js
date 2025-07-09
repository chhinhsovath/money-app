import express from 'express'
import { authenticateToken } from '../middleware/auth.js'
import pool from '../db.js'

const router = express.Router()

// Get all bills
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT 
        b.*,
        c.name as contact_name,
        c.email as contact_email,
        COALESCE(SUM(bli.quantity * bli.unit_price), 0) as subtotal,
        COALESCE(SUM(bli.tax_amount), 0) as tax_total,
        COALESCE(SUM(bli.quantity * bli.unit_price + bli.tax_amount), 0) as total
      FROM bills b
      LEFT JOIN contacts c ON b.contact_id = c.id
      LEFT JOIN bill_line_items bli ON b.id = bli.bill_id
      WHERE b.organization_id = $1
      GROUP BY b.id, c.id
      ORDER BY b.bill_date DESC`,
      [req.user.organizationId]
    )
    res.json(result.rows)
  } catch (error) {
    next(error)
  }
})

// Get single bill
router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const billResult = await pool.query(
      `SELECT 
        b.*,
        c.name as contact_name,
        c.email as contact_email,
        c.phone as contact_phone,
        c.address as contact_address
      FROM bills b
      LEFT JOIN contacts c ON b.contact_id = c.id
      WHERE b.id = $1 AND b.organization_id = $2`,
      [req.params.id, req.user.organizationId]
    )

    if (billResult.rows.length === 0) {
      return res.status(404).json({ message: 'Bill not found' })
    }

    const lineItemsResult = await pool.query(
      `SELECT 
        bli.*,
        it.name as item_name,
        it.code as item_code,
        a.name as account_name,
        a.code as account_code
      FROM bill_line_items bli
      LEFT JOIN items it ON bli.item_id = it.id
      LEFT JOIN accounts a ON bli.account_id = a.id
      WHERE bli.bill_id = $1
      ORDER BY bli.line_order`,
      [req.params.id]
    )

    const bill = billResult.rows[0]
    bill.line_items = lineItemsResult.rows

    res.json(bill)
  } catch (error) {
    next(error)
  }
})

// Create bill
router.post('/', authenticateToken, async (req, res, next) => {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const {
      contact_id,
      bill_number,
      bill_date,
      due_date,
      reference,
      notes,
      line_items
    } = req.body

    // Generate bill number if not provided
    let billNumber = bill_number
    if (!billNumber) {
      const lastBill = await client.query(
        'SELECT bill_number FROM bills WHERE organization_id = $1 ORDER BY created_at DESC LIMIT 1',
        [req.user.organizationId]
      )
      const lastNumber = lastBill.rows[0]?.bill_number || 'BILL-0000'
      const numberPart = parseInt(lastNumber.split('-')[1] || '0') + 1
      billNumber = `BILL-${numberPart.toString().padStart(4, '0')}`
    }

    // Create bill
    const billResult = await client.query(
      `INSERT INTO bills 
        (organization_id, contact_id, bill_number, bill_date, due_date, 
         reference, notes, status, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        req.user.organizationId,
        contact_id,
        billNumber,
        bill_date,
        due_date,
        reference,
        notes,
        'draft',
        req.user.userId
      ]
    )

    const bill = billResult.rows[0]

    // Add line items
    if (line_items && line_items.length > 0) {
      for (let i = 0; i < line_items.length; i++) {
        const item = line_items[i]
        await client.query(
          `INSERT INTO bill_line_items 
            (bill_id, item_id, account_id, description, quantity, unit_price, 
             tax_rate_id, tax_amount, line_order)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            bill.id,
            item.item_id,
            item.account_id,
            item.description,
            item.quantity,
            item.unit_price,
            item.tax_rate_id,
            item.tax_amount || 0,
            i + 1
          ]
        )
      }
    }

    await client.query('COMMIT')
    res.status(201).json(bill)
  } catch (error) {
    await client.query('ROLLBACK')
    next(error)
  } finally {
    client.release()
  }
})

// Update bill
router.put('/:id', authenticateToken, async (req, res, next) => {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const {
      contact_id,
      bill_date,
      due_date,
      reference,
      notes,
      status,
      line_items
    } = req.body

    // Update bill
    const billResult = await client.query(
      `UPDATE bills 
      SET contact_id = $1, bill_date = $2, due_date = $3, 
          reference = $4, notes = $5, status = $6,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $7 AND organization_id = $8
      RETURNING *`,
      [
        contact_id,
        bill_date,
        due_date,
        reference,
        notes,
        status,
        req.params.id,
        req.user.organizationId
      ]
    )

    if (billResult.rows.length === 0) {
      await client.query('ROLLBACK')
      return res.status(404).json({ message: 'Bill not found' })
    }

    // Delete existing line items
    await client.query('DELETE FROM bill_line_items WHERE bill_id = $1', [req.params.id])

    // Add updated line items
    if (line_items && line_items.length > 0) {
      for (let i = 0; i < line_items.length; i++) {
        const item = line_items[i]
        await client.query(
          `INSERT INTO bill_line_items 
            (bill_id, item_id, account_id, description, quantity, unit_price, 
             tax_rate_id, tax_amount, line_order)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            req.params.id,
            item.item_id,
            item.account_id,
            item.description,
            item.quantity,
            item.unit_price,
            item.tax_rate_id,
            item.tax_amount || 0,
            i + 1
          ]
        )
      }
    }

    await client.query('COMMIT')
    res.json(billResult.rows[0])
  } catch (error) {
    await client.query('ROLLBACK')
    next(error)
  } finally {
    client.release()
  }
})

// Delete bill
router.delete('/:id', authenticateToken, async (req, res, next) => {
  try {
    const result = await pool.query(
      'DELETE FROM bills WHERE id = $1 AND organization_id = $2 RETURNING id',
      [req.params.id, req.user.organizationId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Bill not found' })
    }

    res.json({ message: 'Bill deleted successfully' })
  } catch (error) {
    next(error)
  }
})

export default router