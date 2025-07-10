import api from './api'

class ReportService {
  async getProfitLoss(dateRange) {
    // Handle both object and individual parameters
    if (typeof dateRange === 'object' && dateRange.startDate && dateRange.endDate) {
      return api.get(`/reports/profit-loss?start_date=${dateRange.startDate}&end_date=${dateRange.endDate}`)
    }
    // Fallback for direct date parameters
    return api.get(`/reports/profit-loss?start_date=${dateRange}&end_date=${arguments[1]}`)
  }

  async getBalanceSheet(asOfDate) {
    const query = asOfDate ? `?as_of_date=${asOfDate}` : ''
    return api.get(`/reports/balance-sheet${query}`)
  }

  async getCashFlow(startDate, endDate) {
    return api.get(`/reports/cash-flow?start_date=${startDate}&end_date=${endDate}`)
  }

  async getAgedReceivables() {
    return api.get('/reports/aged-receivables')
  }

  async getAgedPayables() {
    return api.get('/reports/aged-payables')
  }
}

export default new ReportService()