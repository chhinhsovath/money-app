import api from './api'

class AccountService {
  async getAll(type = null) {
    const query = type ? `?type=${type}` : ''
    return api.get(`/accounts${query}`)
  }

  async getRevenue() {
    return api.get('/accounts/revenue')
  }

  async getExpense() {
    return api.get('/accounts/expense')
  }
}

export default new AccountService()