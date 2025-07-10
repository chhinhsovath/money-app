import express from 'express'
import db from '../db.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

// Get sales tax report
router.get('/sales-tax', authenticateToken, async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query
    const organizationId = req.user.organizationId

    if (!start_date || !end_date) {
      return res.status(400).json({ error: 'start_date and end_date are required' })
    }

    // Get sales tax collected from invoices
    const salesTaxQuery = `
      SELECT 
        tr.name as tax_name,
        tr.rate as tax_rate,
        SUM(ili.tax_amount) as tax_collected,
        COUNT(DISTINCT i.id) as invoice_count
      FROM invoices i
      JOIN invoice_line_items ili ON i.id = ili.invoice_id
      JOIN tax_rates tr ON ili.tax_rate_id = tr.id
      WHERE i.organization_id = $1 
        AND i.issue_date >= $2 
        AND i.issue_date <= $3
        AND i.status != 'draft'
        AND tr.type IN ('sales', 'both')
      GROUP BY tr.id, tr.name, tr.rate
      ORDER BY tr.rate DESC
    `

    // Get purchase tax paid on bills
    const purchaseTaxQuery = `
      SELECT 
        tr.name as tax_name,
        tr.rate as tax_rate,
        SUM(bli.tax_amount) as tax_paid,
        COUNT(DISTINCT b.id) as bill_count
      FROM bills b
      JOIN bill_line_items bli ON b.id = bli.bill_id
      JOIN tax_rates tr ON bli.tax_rate_id = tr.id
      WHERE b.organization_id = $1 
        AND b.issue_date >= $2 
        AND b.issue_date <= $3
        AND b.status != 'draft'
        AND tr.type IN ('purchase', 'both')
      GROUP BY tr.id, tr.name, tr.rate
      ORDER BY tr.rate DESC
    `

    const [salesTaxResult, purchaseTaxResult] = await Promise.all([
      db.query(salesTaxQuery, [organizationId, start_date, end_date]),
      db.query(purchaseTaxQuery, [organizationId, start_date, end_date])
    ])

    const salesTax = salesTaxResult.rows
    const purchaseTax = purchaseTaxResult.rows

    // Calculate totals
    const totalTaxCollected = salesTax.reduce((sum, item) => sum + parseFloat(item.tax_collected || 0), 0)
    const totalTaxPaid = purchaseTax.reduce((sum, item) => sum + parseFloat(item.tax_paid || 0), 0)
    const netTaxLiability = totalTaxCollected - totalTaxPaid

    res.json({
      period: { start_date, end_date },
      sales_tax: {
        items: salesTax,
        total: totalTaxCollected
      },
      purchase_tax: {
        items: purchaseTax,
        total: totalTaxPaid
      },
      summary: {
        tax_collected: totalTaxCollected,
        tax_paid: totalTaxPaid,
        net_liability: netTaxLiability
      }
    })

  } catch (error) {
    next(error)
  }
})

// Get income tax report
router.get('/income-tax', authenticateToken, async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query
    const organizationId = req.user.organizationId

    if (!start_date || !end_date) {
      return res.status(400).json({ error: 'start_date and end_date are required' })
    }

    // Get total revenue
    const revenueQuery = `
      SELECT 
        COALESCE(SUM(ili.quantity * ili.unit_price), 0) as gross_revenue,
        COALESCE(SUM(ili.tax_amount), 0) as sales_tax
      FROM invoices i
      JOIN invoice_line_items ili ON i.id = ili.invoice_id
      WHERE i.organization_id = $1 
        AND i.issue_date >= $2 
        AND i.issue_date <= $3
        AND i.status != 'draft'
    `

    // Get total expenses (deductible business expenses)
    const expenseQuery = `
      SELECT 
        COALESCE(SUM(bli.quantity * bli.unit_price), 0) as total_expenses,
        COALESCE(SUM(bli.tax_amount), 0) as purchase_tax
      FROM bills b
      JOIN bill_line_items bli ON b.id = bli.bill_id
      WHERE b.organization_id = $1 
        AND b.issue_date >= $2 
        AND b.issue_date <= $3
        AND b.status != 'draft'
    `

    const [revenueResult, expenseResult] = await Promise.all([
      db.query(revenueQuery, [organizationId, start_date, end_date]),
      db.query(expenseQuery, [organizationId, start_date, end_date])
    ])

    const revenue = revenueResult.rows[0]
    const expenses = expenseResult.rows[0]

    const grossRevenue = parseFloat(revenue.gross_revenue || 0)
    const totalExpenses = parseFloat(expenses.total_expenses || 0)
    const taxableIncome = grossRevenue - totalExpenses

    // Simple tax calculation (would need to be customized per jurisdiction)
    let incomeTax = 0
    if (taxableIncome > 0) {
      // Example progressive tax brackets
      if (taxableIncome <= 50000) {
        incomeTax = taxableIncome * 0.20 // 20% for first $50k
      } else if (taxableIncome <= 100000) {
        incomeTax = 50000 * 0.20 + (taxableIncome - 50000) * 0.25 // 25% for next $50k
      } else {
        incomeTax = 50000 * 0.20 + 50000 * 0.25 + (taxableIncome - 100000) * 0.30 // 30% for above $100k
      }
    }

    res.json({
      period: { start_date, end_date },
      revenue: {
        gross_revenue: grossRevenue,
        sales_tax: parseFloat(revenue.sales_tax || 0)
      },
      expenses: {
        total_expenses: totalExpenses,
        purchase_tax: parseFloat(expenses.purchase_tax || 0)
      },
      income_calculation: {
        gross_revenue: grossRevenue,
        deductible_expenses: totalExpenses,
        taxable_income: taxableIncome,
        estimated_income_tax: incomeTax,
        effective_tax_rate: taxableIncome > 0 ? (incomeTax / taxableIncome) * 100 : 0
      }
    })

  } catch (error) {
    next(error)
  }
})

// Get tax liability summary
router.get('/liability', authenticateToken, async (req, res, next) => {
  try {
    const organizationId = req.user.organizationId

    // Get current outstanding tax obligations
    const taxLiabilityQuery = `
      SELECT 
        'Sales Tax' as tax_type,
        COALESCE(SUM(ili.tax_amount), 0) as amount,
        'Monthly' as frequency,
        DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day' as due_date
      FROM invoices i
      JOIN invoice_line_items ili ON i.id = ili.invoice_id
      JOIN tax_rates tr ON ili.tax_rate_id = tr.id
      WHERE i.organization_id = $1 
        AND DATE_TRUNC('month', i.issue_date) = DATE_TRUNC('month', CURRENT_DATE)
        AND i.status != 'draft'
        AND tr.type IN ('sales', 'both')
      
      UNION ALL
      
      SELECT 
        'Purchase Tax Credit' as tax_type,
        -COALESCE(SUM(bli.tax_amount), 0) as amount,
        'Monthly' as frequency,
        DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day' as due_date
      FROM bills b
      JOIN bill_line_items bli ON b.id = bli.bill_id
      JOIN tax_rates tr ON bli.tax_rate_id = tr.id
      WHERE b.organization_id = $1 
        AND DATE_TRUNC('month', b.issue_date) = DATE_TRUNC('month', CURRENT_DATE)
        AND b.status != 'draft'
        AND tr.type IN ('purchase', 'both')
    `

    const result = await db.query(taxLiabilityQuery, [organizationId])
    const liabilities = result.rows

    const totalLiability = liabilities.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0)

    res.json({
      current_period: new Date().toISOString().slice(0, 7), // YYYY-MM format
      liabilities: liabilities,
      total_liability: totalLiability,
      next_filing_date: liabilities[0]?.due_date || null
    })

  } catch (error) {
    next(error)
  }
})

// Get tax rates (CRUD operations)
router.get('/rates', authenticateToken, async (req, res, next) => {
  try {
    const organizationId = req.user.organizationId
    
    const query = `
      SELECT id, name, rate, type, is_active, created_at, updated_at
      FROM tax_rates
      WHERE organization_id = $1
      ORDER BY rate DESC, name
    `
    
    const result = await db.query(query, [organizationId])
    res.json(result.rows)
  } catch (error) {
    next(error)
  }
})

router.post('/rates', authenticateToken, async (req, res, next) => {
  try {
    const organizationId = req.user.organizationId
    const { name, rate, type } = req.body

    if (!name || rate === undefined || !type) {
      return res.status(400).json({ error: 'name, rate, and type are required' })
    }

    const query = `
      INSERT INTO tax_rates (organization_id, name, rate, type)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, rate, type, is_active, created_at, updated_at
    `
    
    const result = await db.query(query, [organizationId, name, rate, type])
    res.status(201).json(result.rows[0])
  } catch (error) {
    next(error)
  }
})

router.put('/rates/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params
    const organizationId = req.user.organizationId
    const { name, rate, type, is_active } = req.body

    const query = `
      UPDATE tax_rates 
      SET name = $1, rate = $2, type = $3, is_active = $4, updated_at = CURRENT_TIMESTAMP
      WHERE id = $5 AND organization_id = $6
      RETURNING id, name, rate, type, is_active, created_at, updated_at
    `
    
    const result = await db.query(query, [name, rate, type, is_active, id, organizationId])
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tax rate not found' })
    }
    
    res.json(result.rows[0])
  } catch (error) {
    next(error)
  }
})

router.delete('/rates/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params
    const organizationId = req.user.organizationId

    const result = await db.query(
      'DELETE FROM tax_rates WHERE id = $1 AND organization_id = $2',
      [id, organizationId]
    )

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Tax rate not found' })
    }

    res.status(204).send()
  } catch (error) {
    next(error)
  }
})

// Get audit trail for tax transactions
router.get('/audit-trail', authenticateToken, async (req, res, next) => {
  try {
    const { start_date, end_date, tax_type } = req.query
    const organizationId = req.user.organizationId

    let invoiceQuery = `
      SELECT 
        'invoice' as transaction_type,
        i.id as transaction_id,
        i.invoice_number as reference,
        i.issue_date as date,
        c.name as contact_name,
        tr.name as tax_name,
        tr.rate as tax_rate,
        ili.tax_amount,
        i.status,
        i.created_at
      FROM invoices i
      JOIN invoice_line_items ili ON i.id = ili.invoice_id
      JOIN tax_rates tr ON ili.tax_rate_id = tr.id
      JOIN contacts c ON i.contact_id = c.id
      WHERE i.organization_id = $1
        AND tr.type IN ('sales', 'both')
    `

    let billQuery = `
      SELECT 
        'bill' as transaction_type,
        b.id as transaction_id,
        b.bill_number as reference,
        b.issue_date as date,
        c.name as contact_name,
        tr.name as tax_name,
        tr.rate as tax_rate,
        bli.tax_amount,
        b.status,
        b.created_at
      FROM bills b
      JOIN bill_line_items bli ON b.id = bli.bill_id
      JOIN tax_rates tr ON bli.tax_rate_id = tr.id
      JOIN contacts c ON b.contact_id = c.id
      WHERE b.organization_id = $1
        AND tr.type IN ('purchase', 'both')
    `

    let params = [organizationId]
    
    if (start_date && end_date) {
      invoiceQuery += ' AND i.issue_date >= $2 AND i.issue_date <= $3'
      billQuery += ' AND b.issue_date >= $2 AND b.issue_date <= $3'
      params.push(start_date, end_date)
    }

    invoiceQuery += ' ORDER BY i.issue_date DESC, i.created_at DESC'
    billQuery += ' ORDER BY b.issue_date DESC, b.created_at DESC'

    const [invoiceResult, billResult] = await Promise.all([
      db.query(invoiceQuery, params),
      db.query(billQuery, params)
    ])

    const auditTrail = [...invoiceResult.rows, ...billResult.rows]
      .sort((a, b) => new Date(b.date) - new Date(a.date))

    res.json({
      period: start_date && end_date ? { start_date, end_date } : null,
      total_transactions: auditTrail.length,
      transactions: auditTrail
    })

  } catch (error) {
    next(error)
  }
})

export default router