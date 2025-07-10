import express from 'express'
import { authenticateToken } from '../middleware/auth.js'
import pool from '../db.js'

const router = express.Router()

// Profit & Loss Report
router.get('/profit-loss', authenticateToken, async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query
    
    if (!start_date || !end_date) {
      return res.status(400).json({ message: 'Start date and end date are required' })
    }

    // Get revenue
    const revenueResult = await pool.query(
      `SELECT 
        a.code,
        a.name,
        COALESCE(SUM(ili.quantity * ili.unit_price + ili.tax_amount), 0) as amount
      FROM accounts a
      LEFT JOIN invoice_line_items ili ON a.id = ili.account_id
      LEFT JOIN invoices i ON ili.invoice_id = i.id
      WHERE a.organization_id = $1
        AND a.type IN ('revenue', 'other_income')
        AND i.issue_date BETWEEN $2 AND $3
        AND i.status != 'draft'
      GROUP BY a.id, a.code, a.name
      ORDER BY a.code`,
      [req.user.organizationId, start_date, end_date]
    )

    // Get expenses
    const expenseResult = await pool.query(
      `SELECT 
        a.code,
        a.name,
        COALESCE(SUM(bli.quantity * bli.unit_price + bli.tax_amount), 0) as amount
      FROM accounts a
      LEFT JOIN bill_line_items bli ON a.id = bli.account_id
      LEFT JOIN bills b ON bli.bill_id = b.id
      WHERE a.organization_id = $1
        AND a.type IN ('expense', 'cost_of_goods_sold', 'other_expense')
        AND b.issue_date BETWEEN $2 AND $3
        AND b.status != 'draft'
      GROUP BY a.id, a.code, a.name
      ORDER BY a.code`,
      [req.user.organizationId, start_date, end_date]
    )

    const totalRevenue = revenueResult.rows.reduce((sum, row) => sum + parseFloat(row.amount), 0)
    const totalExpenses = expenseResult.rows.reduce((sum, row) => sum + parseFloat(row.amount), 0)
    const netProfit = totalRevenue - totalExpenses

    res.json({
      start_date,
      end_date,
      revenue: {
        accounts: revenueResult.rows,
        total: totalRevenue
      },
      expenses: {
        accounts: expenseResult.rows,
        total: totalExpenses
      },
      net_profit: netProfit,
      profit_margin: totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0
    })
  } catch (error) {
    next(error)
  }
})

// Balance Sheet Report
router.get('/balance-sheet', authenticateToken, async (req, res, next) => {
  try {
    const { as_of_date } = req.query
    const date = as_of_date || new Date().toISOString().split('T')[0]

    // Get assets
    const assetsResult = await pool.query(
      `SELECT 
        a.code,
        a.name,
        a.type,
        CASE 
          WHEN a.code LIKE '11%' THEN 
            COALESCE((
              SELECT SUM(
                CASE 
                  WHEN bt.type = 'credit' THEN bt.amount
                  WHEN bt.type = 'debit' THEN -bt.amount
                END
              )
              FROM bank_transactions bt
              WHERE bt.bank_account_id = a.id
                AND bt.date <= $2
            ), 0)
          WHEN a.code = '1300' THEN -- Accounts Receivable
            COALESCE((
              SELECT SUM(i.total)
              FROM (
                SELECT 
                  inv.id,
                  SUM(ili.quantity * ili.unit_price + ili.tax_amount) as total
                FROM invoices inv
                JOIN invoice_line_items ili ON inv.id = ili.invoice_id
                WHERE inv.organization_id = $1
                  AND inv.status IN ('sent', 'overdue')
                  AND inv.issue_date <= $2
                GROUP BY inv.id
              ) i
            ), 0)
          ELSE 0
        END as balance
      FROM accounts a
      WHERE a.organization_id = $1
        AND a.type = 'asset'
        AND a.is_active = true
      ORDER BY a.code`,
      [req.user.organizationId, date]
    )

    // Get liabilities
    const liabilitiesResult = await pool.query(
      `SELECT 
        a.code,
        a.name,
        a.type,
        CASE 
          WHEN a.code = '2000' THEN -- Accounts Payable
            COALESCE((
              SELECT SUM(b.total)
              FROM (
                SELECT 
                  bill.id,
                  SUM(bli.quantity * bli.unit_price + bli.tax_amount) as total
                FROM bills bill
                JOIN bill_line_items bli ON bill.id = bli.bill_id
                WHERE bill.organization_id = $1
                  AND bill.status IN ('approved', 'overdue')
                  AND bill.issue_date <= $2
                GROUP BY bill.id
              ) b
            ), 0)
          ELSE 0
        END as balance
      FROM accounts a
      WHERE a.organization_id = $1
        AND a.type = 'liability'
        AND a.is_active = true
      ORDER BY a.code`,
      [req.user.organizationId, date]
    )

    // Get equity (simplified - would need journal entries for full implementation)
    const equityResult = await pool.query(
      `SELECT 
        code,
        name,
        type,
        0 as balance
      FROM accounts
      WHERE organization_id = $1
        AND type = 'equity'
        AND is_active = true
      ORDER BY code`,
      [req.user.organizationId]
    )

    const totalAssets = assetsResult.rows.reduce((sum, row) => sum + parseFloat(row.balance), 0)
    const totalLiabilities = liabilitiesResult.rows.reduce((sum, row) => sum + parseFloat(row.balance), 0)
    const totalEquity = totalAssets - totalLiabilities // Simplified calculation

    res.json({
      as_of_date: date,
      assets: {
        accounts: assetsResult.rows,
        total: totalAssets
      },
      liabilities: {
        accounts: liabilitiesResult.rows,
        total: totalLiabilities
      },
      equity: {
        accounts: equityResult.rows.map(acc => ({
          ...acc,
          balance: acc.code === '3100' ? totalEquity : 0 // Put all equity in retained earnings for now
        })),
        total: totalEquity
      },
      total_liabilities_and_equity: totalLiabilities + totalEquity
    })
  } catch (error) {
    next(error)
  }
})

// Cash Flow Report
router.get('/cash-flow', authenticateToken, async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query
    
    if (!start_date || !end_date) {
      return res.status(400).json({ message: 'Start date and end date are required' })
    }

    // Get cash transactions
    const cashFlowResult = await pool.query(
      `SELECT 
        bt.type,
        bt.description,
        bt.amount,
        bt.date,
        c.name as contact_name,
        CASE 
          WHEN bt.description ILIKE '%invoice%' OR bt.description ILIKE '%payment%' THEN 'operating'
          WHEN bt.description ILIKE '%loan%' OR bt.description ILIKE '%investment%' THEN 'financing'
          WHEN bt.description ILIKE '%equipment%' OR bt.description ILIKE '%asset%' THEN 'investing'
          ELSE 'operating'
        END as category
      FROM bank_transactions bt
      LEFT JOIN contacts c ON bt.contact_id = c.id
      WHERE bt.organization_id = $1
        AND bt.date BETWEEN $2 AND $3
      ORDER BY bt.date DESC`,
      [req.user.organizationId, start_date, end_date]
    )

    // Calculate totals by category
    const operating = cashFlowResult.rows
      .filter(t => t.category === 'operating')
      .reduce((sum, t) => sum + (t.type === 'credit' ? parseFloat(t.amount) : -parseFloat(t.amount)), 0)
    
    const investing = cashFlowResult.rows
      .filter(t => t.category === 'investing')
      .reduce((sum, t) => sum + (t.type === 'credit' ? parseFloat(t.amount) : -parseFloat(t.amount)), 0)
    
    const financing = cashFlowResult.rows
      .filter(t => t.category === 'financing')
      .reduce((sum, t) => sum + (t.type === 'credit' ? parseFloat(t.amount) : -parseFloat(t.amount)), 0)

    res.json({
      start_date,
      end_date,
      operating_activities: {
        transactions: cashFlowResult.rows.filter(t => t.category === 'operating'),
        total: operating
      },
      investing_activities: {
        transactions: cashFlowResult.rows.filter(t => t.category === 'investing'),
        total: investing
      },
      financing_activities: {
        transactions: cashFlowResult.rows.filter(t => t.category === 'financing'),
        total: financing
      },
      net_cash_flow: operating + investing + financing
    })
  } catch (error) {
    next(error)
  }
})

// Aged Receivables Report
router.get('/aged-receivables', authenticateToken, async (req, res, next) => {
  try {
    const today = new Date()
    
    const result = await pool.query(
      `SELECT 
        i.id,
        i.invoice_number,
        i.issue_date,
        i.due_date,
        c.name as contact_name,
        SUM(ili.quantity * ili.unit_price + ili.tax_amount) as total,
        (CURRENT_DATE - i.due_date) as days_overdue
      FROM invoices i
      JOIN contacts c ON i.contact_id = c.id
      JOIN invoice_line_items ili ON i.id = ili.invoice_id
      WHERE i.organization_id = $1
        AND i.status IN ('sent', 'overdue')
      GROUP BY i.id, c.name
      ORDER BY days_overdue DESC`,
      [req.user.organizationId]
    )

    // Categorize by age
    const current = result.rows.filter(inv => inv.days_overdue <= 0)
    const days_1_30 = result.rows.filter(inv => inv.days_overdue > 0 && inv.days_overdue <= 30)
    const days_31_60 = result.rows.filter(inv => inv.days_overdue > 30 && inv.days_overdue <= 60)
    const days_61_90 = result.rows.filter(inv => inv.days_overdue > 60 && inv.days_overdue <= 90)
    const over_90 = result.rows.filter(inv => inv.days_overdue > 90)

    const calculateTotal = (invoices) => invoices.reduce((sum, inv) => sum + parseFloat(inv.total), 0)

    res.json({
      as_of_date: today.toISOString().split('T')[0],
      current: {
        invoices: current,
        total: calculateTotal(current)
      },
      days_1_30: {
        invoices: days_1_30,
        total: calculateTotal(days_1_30)
      },
      days_31_60: {
        invoices: days_31_60,
        total: calculateTotal(days_31_60)
      },
      days_61_90: {
        invoices: days_61_90,
        total: calculateTotal(days_61_90)
      },
      over_90: {
        invoices: over_90,
        total: calculateTotal(over_90)
      },
      total_outstanding: calculateTotal(result.rows)
    })
  } catch (error) {
    next(error)
  }
})

// Aged Payables Report
router.get('/aged-payables', authenticateToken, async (req, res, next) => {
  try {
    const today = new Date()
    
    const result = await pool.query(
      `SELECT 
        b.id,
        b.bill_number,
        b.issue_date,
        b.due_date,
        c.name as contact_name,
        SUM(bli.quantity * bli.unit_price + bli.tax_amount) as total,
        (CURRENT_DATE - b.due_date) as days_overdue
      FROM bills b
      JOIN contacts c ON b.contact_id = c.id
      JOIN bill_line_items bli ON b.id = bli.bill_id
      WHERE b.organization_id = $1
        AND b.status IN ('approved', 'overdue')
      GROUP BY b.id, c.name
      ORDER BY days_overdue DESC`,
      [req.user.organizationId]
    )

    // Categorize by age
    const current = result.rows.filter(bill => bill.days_overdue <= 0)
    const days_1_30 = result.rows.filter(bill => bill.days_overdue > 0 && bill.days_overdue <= 30)
    const days_31_60 = result.rows.filter(bill => bill.days_overdue > 30 && bill.days_overdue <= 60)
    const days_61_90 = result.rows.filter(bill => bill.days_overdue > 60 && bill.days_overdue <= 90)
    const over_90 = result.rows.filter(bill => bill.days_overdue > 90)

    const calculateTotal = (bills) => bills.reduce((sum, bill) => sum + parseFloat(bill.total), 0)

    res.json({
      as_of_date: today.toISOString().split('T')[0],
      current: {
        bills: current,
        total: calculateTotal(current)
      },
      days_1_30: {
        bills: days_1_30,
        total: calculateTotal(days_1_30)
      },
      days_31_60: {
        bills: days_31_60,
        total: calculateTotal(days_31_60)
      },
      days_61_90: {
        bills: days_61_90,
        total: calculateTotal(days_61_90)
      },
      over_90: {
        bills: over_90,
        total: calculateTotal(over_90)
      },
      total_outstanding: calculateTotal(result.rows)
    })
  } catch (error) {
    next(error)
  }
})

export default router