import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { verifyAuth } from '@/lib/auth'

// GET /api/contacts - Get all contacts
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const result = await pool.query(
      `SELECT c.*, 
        COUNT(DISTINCT i.id) as invoice_count,
        COUNT(DISTINCT b.id) as bill_count,
        COALESCE(SUM(DISTINCT i.total), 0) as total_revenue,
        COALESCE(SUM(DISTINCT b.total), 0) as total_expenses
      FROM contacts c
      LEFT JOIN invoices i ON c.id = i.contact_id
      LEFT JOIN bills b ON c.id = b.contact_id
      WHERE c.organization_id = $1
      GROUP BY c.id
      ORDER BY c.name`,
      [user.organizationId]
    )

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Get contacts error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/contacts - Create new contact
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const {
      name,
      email,
      phone,
      type,
      taxNumber,
      address,
      contactPerson,
      notes
    } = data

    const result = await pool.query(
      `INSERT INTO contacts (
        organization_id, name, email, phone, type, tax_number,
        address_line1, address_line2, city, state, postal_code, country,
        contact_person, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *`,
      [
        user.organizationId,
        name,
        email,
        phone,
        type || 'customer',
        taxNumber,
        address?.line1,
        address?.line2,
        address?.city,
        address?.state,
        address?.postalCode,
        address?.country,
        contactPerson,
        notes
      ]
    )

    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error) {
    console.error('Create contact error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}