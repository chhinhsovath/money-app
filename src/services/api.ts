const API_URL = '/api'

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>
}

class ApiService {
  async request(endpoint: string, options: RequestOptions = {}) {
    const config: RequestOptions = {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    }

    try {
      const response = await fetch(`${API_URL}${endpoint}`, config)

      // Check if response has content
      const contentType = response.headers.get('content-type')
      const hasJson = contentType && contentType.includes('application/json')
      
      if (!response.ok) {
        let error = { message: 'An error occurred' }
        
        if (hasJson) {
          try {
            const errorData = await response.json()
            // Handle both { message: "..." } and { error: { message: "..." } } formats
            error = errorData.error || errorData
          } catch (e) {
            console.error('Failed to parse error response:', e)
          }
        }
        
        throw new Error(error.message || `Server error: ${response.status}`)
      }

      // Return empty object if no content
      if (response.status === 204 || !hasJson) {
        return {}
      }

      return response.json()
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  get(endpoint: string) {
    return this.request(endpoint, { method: 'GET' })
  }

  post(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  put(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  delete(endpoint: string) {
    return this.request(endpoint, { method: 'DELETE' })
  }
}

export default new ApiService()