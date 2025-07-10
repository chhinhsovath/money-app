import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { verifyAuth } from '@/lib/auth'

// GET /api/contacts/:id - Get single contact
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const result = await pool.query(
      'SELECT * FROM contacts WHERE id = $1 AND organization_id = $2',
      [params.id, user.organizationId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ message: 'Contact not found' }, { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Get contact error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/contacts/:id - Update contact
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      `UPDATE contacts SET
        name = $1, email = $2, phone = $3, type = $4, tax_number = $5,
        address_line1 = $6, address_line2 = $7, city = $8, state = $9,
        postal_code = $10, country = $11, contact_person = $12, notes = $13,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $14 AND organization_id = $15
      RETURNING *`,
      [
        name,
        email,
        phone,
        type,
        taxNumber,
        address?.line1,
        address?.line2,
        address?.city,
        address?.state,
        address?.postalCode,
        address?.country,
        contactPerson,
        notes,
        params.id,
        user.organizationId
      ]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ message: 'Contact not found' }, { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Update contact error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/contacts/:id - Delete contact
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    // Check for related records
    const invoiceCheck = await pool.query(
      'SELECT COUNT(*) FROM invoices WHERE contact_id = $1',
      [params.id]
    )

    const billCheck = await pool.query(
      'SELECT COUNT(*) FROM bills WHERE contact_id = $1',
      [params.id]
    )

    if (invoiceCheck.rows[0].count > 0 || billCheck.rows[0].count > 0) {
      return NextResponse.json(
        { message: 'Cannot delete contact with existing invoices or bills' },
        { status: 400 }
      )
    }

    const result = await pool.query(
      'DELETE FROM contacts WHERE id = $1 AND organization_id = $2 RETURNING id',
      [params.id, user.organizationId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ message: 'Contact not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Contact deleted successfully' })
  } catch (error) {
    console.error('Delete contact error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}