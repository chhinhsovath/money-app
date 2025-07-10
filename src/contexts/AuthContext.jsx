import { createContext, useContext, useState, useEffect } from 'react'
import AuthService from '@/services/AuthService'
import { useNavigate } from 'react-router-dom'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await AuthService.getCurrentUser()
      setUser(response.user)
    } catch (error) {
      console.log('Auth check failed:', error.message)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (credentials) => {
    try {
      const response = await AuthService.login(credentials)
      setUser(response.user)
      navigate('/dashboard')
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const register = async (userData) => {
    try {
      const response = await AuthService.register(userData)
      setUser(response.user)
      navigate('/dashboard')
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const logout = async () => {
    try {
      await AuthService.logout()
      setUser(null)
      navigate('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const updateProfile = async (profileData) => {
    try {
      // TODO: Implement profile update API call
      console.log('Profile update:', profileData)
      // For now, just update local user state
      setUser(prev => ({ ...prev, ...profileData }))
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    checkAuth,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}