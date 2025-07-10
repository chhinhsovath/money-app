import { withAuth } from '../../lib/auth.js'
import { query } from '../../lib/db.js'

async function handler(req, res) {
  const { organizationId } = req.user

  if (req.method === 'GET') {
    try {
      const result = await query(
        `SELECT i.*, c.name as contact_name 
         FROM invoices i
         LEFT JOIN contacts c ON i.contact_id = c.id
         WHERE i.organization_id = $1
         ORDER BY i.created_at DESC`,
        [organizationId]
      )

      res.json(result.rows)
    } catch (error) {
      console.error('Error fetching invoices:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  } else if (req.method === 'POST') {
    try {
      const { contact_id, invoice_date, due_date, line_items, tax_rate_id } = req.body

      await query('BEGIN')

      // Create invoice
      const invoiceResult = await query(
        `INSERT INTO invoices (organization_id, contact_id, invoice_date, due_date, status, tax_rate_id)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [organizationId, contact_id, invoice_date, due_date, 'draft', tax_rate_id]
      )

      const invoice = invoiceResult.rows[0]

      // Create line items
      if (line_items && line_items.length > 0) {
        for (const item of line_items) {
          await query(
            `INSERT INTO invoice_line_items (invoice_id, description, quantity, unit_price, tax_rate_id)
             VALUES ($1, $2, $3, $4, $5)`,
            [invoice.id, item.description, item.quantity, item.unit_price, item.tax_rate_id]
          )
        }
      }

      await query('COMMIT')

      res.json(invoice)
    } catch (error) {
      await query('ROLLBACK')
      console.error('Error creating invoice:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}

export default withAuth(handler)