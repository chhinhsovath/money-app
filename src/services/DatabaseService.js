import api from './api'

class DatabaseService {
  // Get all tables with metadata
  async getTables() {
    const response = await api.get('/database/tables')
    return response.data
  }

  // Get table structure (columns, constraints, indexes)
  async getTableStructure(tableName) {
    const response = await api.get(`/database/tables/${tableName}/structure`)
    return response.data
  }

  // Browse table data with pagination
  async getTableData(tableName, options = {}) {
    const { page = 1, limit = 50, sortBy = null, sortOrder = 'ASC', filter = null } = options
    const params = new URLSearchParams({
      page,
      limit,
      ...(sortBy && { sortBy }),
      ...(sortOrder && { sortOrder }),
      ...(filter && { filter })
    })
    
    const response = await api.get(`/database/tables/${tableName}/data?${params}`)
    return response.data
  }

  // Execute SQL query
  async executeQuery(query, params = []) {
    const response = await api.post('/database/query', { query, params })
    return response.data
  }

  // Get table relationships for ERD
  async getRelationships() {
    const response = await api.get('/database/relationships')
    return response.data
  }

  // Get database statistics
  async getStatistics() {
    const response = await api.get('/database/statistics')
    return response.data
  }

  // Get migration history
  async getMigrations() {
    const response = await api.get('/database/migrations')
    return response.data
  }
}

export default new DatabaseService()