import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { query } from '../../lib/db.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { email, password, firstName, lastName, organizationName } = req.body

    const userExists = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    )

    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    // Start transaction
    await query('BEGIN')

    const orgResult = await query(
      'INSERT INTO organizations (name) VALUES ($1) RETURNING id',
      [organizationName || 'My Company']
    )
    const organizationId = orgResult.rows[0].id

    const userResult = await query(
      'INSERT INTO users (email, password_hash, first_name, last_name, organization_id, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, email, first_name, last_name, organization_id, role',
      [email, hashedPassword, firstName, lastName, organizationId, 'admin']
    )

    await query('COMMIT')

    const user = userResult.rows[0]
    const token = jwt.sign(
      { userId: user.id, organizationId: user.organization_id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.setHeader(
      'Set-Cookie',
      `token=${token}; HttpOnly; Secure; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}; Path=/`
    )

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        organizationId: user.organization_id,
        role: user.role
      }
    })
  } catch (error) {
    await query('ROLLBACK')
    console.error('Registration error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}