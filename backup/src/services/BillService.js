import api from './api'

class BillService {
  async getAll() {
    return api.get('/bills')
  }

  async getById(id) {
    return api.get(`/bills/${id}`)
  }

  async create(bill) {
    return api.post('/bills', bill)
  }

  async update(id, bill) {
    return api.put(`/bills/${id}`, bill)
  }

  async delete(id) {
    return api.delete(`/bills/${id}`)
  }
}

export default new BillService()