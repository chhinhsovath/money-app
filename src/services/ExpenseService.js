import api from './api'

class ExpenseService {
  async getAll() {
    return api.get('/expenses')
  }

  async getById(id) {
    return api.get(`/expenses/${id}`)
  }

  async create(expense) {
    return api.post('/expenses', expense)
  }

  async update(id, expense) {
    return api.put(`/expenses/${id}`, expense)
  }

  async delete(id) {
    return api.delete(`/expenses/${id}`)
  }

  async submit(id) {
    return api.post(`/expenses/${id}/submit`)
  }

  async approve(id) {
    return api.post(`/expenses/${id}/approve`)
  }

  async reject(id) {
    return api.post(`/expenses/${id}/reject`)
  }
}

export default new ExpenseService()