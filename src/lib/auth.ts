import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

export interface AuthUser {
  userId: number
  organizationId: number
}

export async function verifyAuth(request: NextRequest): Promise<AuthUser | null> {
  try {
    const token = request.cookies.get('token')?.value

    if (!token) {
      return null
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AuthUser
    return decoded
  } catch (error) {
    return null
  }
}