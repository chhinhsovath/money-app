import api from './api'

class AuthService {
  async register(userData) {
    return api.post('/auth/register', userData)
  }

  async login(credentials) {
    return api.post('/auth/login', credentials)
  }

  async logout() {
    return api.post('/auth/logout')
  }

  async getCurrentUser() {
    return api.get('/auth/me')
  }
}

export default new AuthService()