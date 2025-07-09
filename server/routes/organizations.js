import express from 'express'
import { authenticateToken } from '../middleware/auth.js'
import pool from '../db.js'

const router = express.Router()

router.get('/current', authenticateToken, async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT * FROM organizations WHERE id = $1',
      [req.user.organizationId]
    )
    res.json(result.rows[0])
  } catch (error) {
    next(error)
  }
})

export default router