import api from './api'

class BankTransactionService {
  async getAll(filters = {}) {
    const params = new URLSearchParams()
    
    if (filters.bank_account_id) params.append('bank_account_id', filters.bank_account_id)
    if (filters.start_date) params.append('start_date', filters.start_date)
    if (filters.end_date) params.append('end_date', filters.end_date)
    if (filters.is_reconciled !== undefined) params.append('is_reconciled', filters.is_reconciled)
    if (filters.search) params.append('search', filters.search)
    
    const query = params.toString() ? `?${params.toString()}` : ''
    return api.get(`/bank-transactions${query}`)
  }

  async getById(id) {
    return api.get(`/bank-transactions/${id}`)
  }

  async create(transaction) {
    return api.post('/bank-transactions', transaction)
  }

  async update(id, transaction) {
    return api.put(`/bank-transactions/${id}`, transaction)
  }

  async delete(id) {
    return api.delete(`/bank-transactions/${id}`)
  }

  async reconcile(transactionIds, isReconciled) {
    return api.post('/bank-transactions/reconcile', {
      transaction_ids: transactionIds,
      is_reconciled: isReconciled
    })
  }
}

export default new BankTransactionService()