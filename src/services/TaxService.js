import api from './api'

class TaxService {
  // Tax Rates CRUD
  async getTaxRates() {
    return api.get('/tax/rates')
  }

  async createTaxRate(taxRate) {
    return api.post('/tax/rates', taxRate)
  }

  async updateTaxRate(id, taxRate) {
    return api.put(`/tax/rates/${id}`, taxRate)
  }

  async deleteTaxRate(id) {
    return api.delete(`/tax/rates/${id}`)
  }

  // Tax Reports
  async getSalesTaxReport(startDate, endDate) {
    return api.get(`/tax/sales-tax?start_date=${startDate}&end_date=${endDate}`)
  }

  async getIncomeTaxReport(startDate, endDate) {
    return api.get(`/tax/income-tax?start_date=${startDate}&end_date=${endDate}`)
  }

  async getTaxLiability() {
    return api.get('/tax/liability')
  }

  async getTaxAuditTrail(startDate, endDate) {
    const params = new URLSearchParams()
    if (startDate) params.append('start_date', startDate)
    if (endDate) params.append('end_date', endDate)
    return api.get(`/tax/audit-trail?${params.toString()}`)
  }
}

export default new TaxService()