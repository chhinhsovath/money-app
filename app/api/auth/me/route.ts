import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { verifyAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const result = await pool.query(
      'SELECT id, email, first_name, last_name, organization_id, role FROM users WHERE id = $1',
      [user.userId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    const userData = result.rows[0]
    return NextResponse.json({
      user: {
        id: userData.id,
        email: userData.email,
        firstName: userData.first_name,
        lastName: userData.last_name,
        organizationId: userData.organization_id,
        role: userData.role
      }
    })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}