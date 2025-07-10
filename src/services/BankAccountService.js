import api from './api'

class BankAccountService {
  async getAll() {
    return api.get('/bank-accounts')
  }

  async getById(id) {
    return api.get(`/bank-accounts/${id}`)
  }

  async create(bankAccount) {
    return api.post('/bank-accounts', bankAccount)
  }

  async update(id, bankAccount) {
    return api.put(`/bank-accounts/${id}`, bankAccount)
  }

  async delete(id) {
    return api.delete(`/bank-accounts/${id}`)
  }
}

export default new BankAccountService()