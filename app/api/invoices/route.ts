import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { verifyAuth } from '@/lib/auth'

// GET /api/invoices - Get all invoices
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const result = await pool.query(
      `SELECT 
        i.*,
        c.name as contact_name,
        c.email as contact_email,
        COALESCE(SUM(p.amount), 0) as amount_paid,
        i.total - COALESCE(SUM(p.amount), 0) as amount_due
      FROM invoices i
      LEFT JOIN contacts c ON i.contact_id = c.id
      LEFT JOIN payment_allocations pa ON pa.invoice_id = i.id
      LEFT JOIN payments p ON p.id = pa.payment_id
      WHERE i.organization_id = $1
      GROUP BY i.id, c.name, c.email
      ORDER BY i.invoice_date DESC`,
      [user.organizationId]
    )

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Get invoices error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/invoices - Create new invoice
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const {
      contactId,
      invoiceNumber,
      issueDate,
      dueDate,
      items,
      notes,
      terms
    } = data

    await pool.query('BEGIN')

    // Calculate totals
    let subtotal = 0
    let taxTotal = 0
    
    items.forEach((item: any) => {
      const lineTotal = item.quantity * item.unitPrice
      const lineTax = (lineTotal * (item.taxRate || 0)) / 100
      subtotal += lineTotal
      taxTotal += lineTax
    })

    const total = subtotal + taxTotal

    // Create invoice
    const invoiceResult = await pool.query(
      `INSERT INTO invoices (
        organization_id, contact_id, invoice_number, invoice_date, due_date,
        subtotal, tax_total, total, status, notes, terms
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        user.organizationId,
        contactId,
        invoiceNumber,
        issueDate,
        dueDate,
        subtotal,
        taxTotal,
        total,
        'draft',
        notes,
        terms
      ]
    )

    const invoice = invoiceResult.rows[0]

    // Create invoice line items
    for (const item of items) {
      const lineTotal = item.quantity * item.unitPrice
      const lineTax = (lineTotal * (item.taxRate || 0)) / 100

      await pool.query(
        `INSERT INTO invoice_line_items (
          invoice_id, item_id, description, quantity, unit_price,
          discount_percentage, tax_rate_id, line_total, tax_amount, total
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          invoice.id,
          item.itemId || null,
          item.description,
          item.quantity,
          item.unitPrice,
          item.discount || 0,
          item.taxRateId || null,
          lineTotal,
          lineTax,
          lineTotal + lineTax
        ]
      )
    }

    // Create journal entries for the invoice
    const journalResult = await pool.query(
      `INSERT INTO journal_entries (
        organization_id, transaction_date, description, reference_type, reference_id
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING id`,
      [
        user.organizationId,
        issueDate,
        `Invoice ${invoiceNumber}`,
        'invoice',
        invoice.id
      ]
    )

    const journalId = journalResult.rows[0].id

    // Debit: Accounts Receivable
    await pool.query(
      `INSERT INTO journal_entry_lines (
        journal_entry_id, account_id, debit, credit, description
      ) VALUES ($1, $2, $3, $4, $5)`,
      [
        journalId,
        1200, // Accounts Receivable account
        total,
        0,
        `Invoice ${invoiceNumber} - ${invoice.contact_name || 'Customer'}`
      ]
    )

    // Credit: Revenue
    await pool.query(
      `INSERT INTO journal_entry_lines (
        journal_entry_id, account_id, debit, credit, description
      ) VALUES ($1, $2, $3, $4, $5)`,
      [
        journalId,
        4000, // Revenue account
        0,
        subtotal,
        `Revenue from Invoice ${invoiceNumber}`
      ]
    )

    // Credit: Sales Tax Payable (if applicable)
    if (taxTotal > 0) {
      await pool.query(
        `INSERT INTO journal_entry_lines (
          journal_entry_id, account_id, debit, credit, description
        ) VALUES ($1, $2, $3, $4, $5)`,
        [
          journalId,
          2200, // Sales Tax Payable account
          0,
          taxTotal,
          `Sales tax for Invoice ${invoiceNumber}`
        ]
      )
    }

    await pool.query('COMMIT')

    return NextResponse.json(invoice, { status: 201 })
  } catch (error) {
    await pool.query('ROLLBACK')
    console.error('Create invoice error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}