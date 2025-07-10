import api from './api'

class InvoiceService {
  async getAll() {
    return api.get('/invoices')
  }

  async getById(id) {
    return api.get(`/invoices/${id}`)
  }

  async create(invoice) {
    return api.post('/invoices', invoice)
  }

  async update(id, invoice) {
    return api.put(`/invoices/${id}`, invoice)
  }

  async delete(id) {
    return api.delete(`/invoices/${id}`)
  }
}

export default new InvoiceService()