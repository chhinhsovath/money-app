import express from 'express'
import { authenticateToken } from '../middleware/auth.js'
import pool from '../db.js'

const router = express.Router()

// Get all contacts
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const { type } = req.query
    let query = 'SELECT * FROM contacts WHERE organization_id = $1'
    const params = [req.user.organizationId]
    
    if (type) {
      query += ' AND type = $2'
      params.push(type)
    }
    
    query += ' ORDER BY name'
    
    const result = await pool.query(query, params)
    res.json(result.rows)
  } catch (error) {
    next(error)
  }
})

// Get single contact
router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT * FROM contacts WHERE id = $1 AND organization_id = $2',
      [req.params.id, req.user.organizationId]
    )
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Contact not found' })
    }
    
    res.json(result.rows[0])
  } catch (error) {
    next(error)
  }
})

// Create contact
router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const {
      name,
      type,
      email,
      phone,
      address,
      tax_number,
      contact_person
    } = req.body

    const result = await pool.query(
      `INSERT INTO contacts 
        (organization_id, name, type, email, phone, address, tax_number, contact_person)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        req.user.organizationId,
        name,
        type,
        email,
        phone,
        address,
        tax_number,
        contact_person
      ]
    )

    res.status(201).json(result.rows[0])
  } catch (error) {
    next(error)
  }
})

// Update contact
router.put('/:id', authenticateToken, async (req, res, next) => {
  try {
    const {
      name,
      type,
      email,
      phone,
      address,
      tax_number,
      contact_person
    } = req.body

    const result = await pool.query(
      `UPDATE contacts 
      SET name = $1, type = $2, email = $3, phone = $4, 
          address = $5, tax_number = $6, contact_person = $7,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $8 AND organization_id = $9
      RETURNING *`,
      [
        name,
        type,
        email,
        phone,
        address,
        tax_number,
        contact_person,
        req.params.id,
        req.user.organizationId
      ]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Contact not found' })
    }

    res.json(result.rows[0])
  } catch (error) {
    next(error)
  }
})

// Delete contact
router.delete('/:id', authenticateToken, async (req, res, next) => {
  try {
    const result = await pool.query(
      'DELETE FROM contacts WHERE id = $1 AND organization_id = $2 RETURNING id',
      [req.params.id, req.user.organizationId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Contact not found' })
    }

    res.json({ message: 'Contact deleted successfully' })
  } catch (error) {
    next(error)
  }
})

export default router