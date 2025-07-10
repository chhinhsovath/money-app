import api from './api'

class ContactService {
  async getAll(type = null) {
    const query = type ? `?type=${type}` : ''
    return api.get(`/contacts${query}`)
  }

  async getById(id) {
    return api.get(`/contacts/${id}`)
  }

  async create(contact) {
    return api.post('/contacts', contact)
  }

  async update(id, contact) {
    return api.put(`/contacts/${id}`, contact)
  }

  async delete(id) {
    return api.delete(`/contacts/${id}`)
  }
}

export default new ContactService()