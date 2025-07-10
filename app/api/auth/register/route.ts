import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import pool from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName, organizationName } = await request.json()

    const userExists = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    )

    if (userExists.rows.length > 0) {
      return NextResponse.json({ message: 'User already exists' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await pool.query('BEGIN')

    const orgResult = await pool.query(
      'INSERT INTO organizations (name) VALUES ($1) RETURNING id',
      [organizationName || 'My Company']
    )
    const organizationId = orgResult.rows[0].id

    const userResult = await pool.query(
      'INSERT INTO users (email, password_hash, first_name, last_name, organization_id, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, email, first_name, last_name, organization_id, role',
      [email, hashedPassword, firstName, lastName, organizationId, 'admin']
    )

    await pool.query('COMMIT')

    const user = userResult.rows[0]
    const token = jwt.sign(
      { userId: user.id, organizationId: user.organization_id },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        organizationId: user.organization_id,
        role: user.role
      }
    })

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    return response
  } catch (error) {
    await pool.query('ROLLBACK')
    console.error('Registration error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}