import express from 'express'
import { authenticateToken } from '../middleware/auth.js'
import pool from '../db.js'

const router = express.Router()

router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT id, email, first_name, last_name, role FROM users WHERE organization_id = $1',
      [req.user.organizationId]
    )
    res.json(result.rows)
  } catch (error) {
    next(error)
  }
})

export default router