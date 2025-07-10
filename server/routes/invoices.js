import express from 'express'
import { authenticateToken } from '../middleware/auth.js'
import pool from '../db.js'

const router = express.Router()

// Get all invoices
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT 
        i.*,
        c.name as contact_name,
        c.email as contact_email
      FROM invoices i
      LEFT JOIN contacts c ON i.contact_id = c.id
      WHERE i.organization_id = $1
      ORDER BY i.issue_date DESC`,
      [req.user.organizationId]
    )
    res.json(result.rows)
  } catch (error) {
    next(error)
  }
})

// Get single invoice
router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const invoiceResult = await pool.query(
      `SELECT 
        i.*,
        c.name as contact_name,
        c.email as contact_email,
        c.phone as contact_phone,
        c.address as contact_address
      FROM invoices i
      LEFT JOIN contacts c ON i.contact_id = c.id
      WHERE i.id = $1 AND i.organization_id = $2`,
      [req.params.id, req.user.organizationId]
    )

    if (invoiceResult.rows.length === 0) {
      return res.status(404).json({ message: 'Invoice not found' })
    }

    const lineItemsResult = await pool.query(
      `SELECT 
        ili.*,
        it.name as item_name,
        it.code as item_code,
        a.name as account_name,
        a.code as account_code
      FROM invoice_line_items ili
      LEFT JOIN items it ON ili.item_id = it.id
      LEFT JOIN accounts a ON ili.account_id = a.id
      WHERE ili.invoice_id = $1
      ORDER BY ili.line_order`,
      [req.params.id]
    )

    const invoice = invoiceResult.rows[0]
    invoice.line_items = lineItemsResult.rows

    res.json(invoice)
  } catch (error) {
    next(error)
  }
})

// Create invoice
router.post('/', authenticateToken, async (req, res, next) => {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const {
      contact_id,
      invoice_number,
      invoice_date,
      due_date,
      reference,
      notes,
      terms,
      line_items
    } = req.body

    // Generate invoice number if not provided
    let invoiceNumber = invoice_number
    if (!invoiceNumber) {
      const lastInvoice = await client.query(
        'SELECT invoice_number FROM invoices WHERE organization_id = $1 ORDER BY created_at DESC LIMIT 1',
        [req.user.organizationId]
      )
      const lastNumber = lastInvoice.rows[0]?.invoice_number || 'INV-0000'
      const numberPart = parseInt(lastNumber.split('-')[1] || '0') + 1
      invoiceNumber = `INV-${numberPart.toString().padStart(4, '0')}`
    }

    // Create invoice
    const invoiceResult = await client.query(
      `INSERT INTO invoices 
        (organization_id, contact_id, invoice_number, invoice_date, due_date, 
         reference, notes, terms, status, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        req.user.organizationId,
        contact_id,
        invoiceNumber,
        invoice_date,
        due_date,
        reference,
        notes,
        terms,
        'draft',
        req.user.userId
      ]
    )

    const invoice = invoiceResult.rows[0]

    // Add line items
    if (line_items && line_items.length > 0) {
      for (let i = 0; i < line_items.length; i++) {
        const item = line_items[i]
        await client.query(
          `INSERT INTO invoice_line_items 
            (invoice_id, item_id, account_id, description, quantity, unit_price, 
             tax_rate_id, tax_amount, line_order)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            invoice.id,
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
    res.status(201).json(invoice)
  } catch (error) {
    await client.query('ROLLBACK')
    next(error)
  } finally {
    client.release()
  }
})

// Update invoice
router.put('/:id', authenticateToken, async (req, res, next) => {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const {
      contact_id,
      invoice_date,
      due_date,
      reference,
      notes,
      terms,
      status,
      line_items
    } = req.body

    // Update invoice
    const invoiceResult = await client.query(
      `UPDATE invoices 
      SET contact_id = $1, invoice_date = $2, due_date = $3, 
          reference = $4, notes = $5, terms = $6, status = $7,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $8 AND organization_id = $9
      RETURNING *`,
      [
        contact_id,
        invoice_date,
        due_date,
        reference,
        notes,
        terms,
        status,
        req.params.id,
        req.user.organizationId
      ]
    )

    if (invoiceResult.rows.length === 0) {
      await client.query('ROLLBACK')
      return res.status(404).json({ message: 'Invoice not found' })
    }

    // Delete existing line items
    await client.query('DELETE FROM invoice_line_items WHERE invoice_id = $1', [req.params.id])

    // Add updated line items
    if (line_items && line_items.length > 0) {
      for (let i = 0; i < line_items.length; i++) {
        const item = line_items[i]
        await client.query(
          `INSERT INTO invoice_line_items 
            (invoice_id, item_id, account_id, description, quantity, unit_price, 
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
    res.json(invoiceResult.rows[0])
  } catch (error) {
    await client.query('ROLLBACK')
    next(error)
  } finally {
    client.release()
  }
})

// Delete invoice
router.delete('/:id', authenticateToken, async (req, res, next) => {
  try {
    const result = await pool.query(
      'DELETE FROM invoices WHERE id = $1 AND organization_id = $2 RETURNING id',
      [req.params.id, req.user.organizationId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Invoice not found' })
    }

    res.json({ message: 'Invoice deleted successfully' })
  } catch (error) {
    next(error)
  }
})

export default router