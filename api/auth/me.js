import jwt from 'jsonwebtoken'
import { query } from '../../lib/db.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '')

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    const result = await query(
      'SELECT id, email, first_name, last_name, organization_id, role FROM users WHERE id = $1',
      [decoded.userId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' })
    }

    const user = result.rows[0]
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
    console.error('Auth check error:', error)
    res.status(401).json({ message: 'Unauthorized' })
  }
}