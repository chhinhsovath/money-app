import { execSync } from 'child_process';

/**
 * Context7 integration for Claude Code
 * Provides utilities to query documentation and enhance Claude's context
 */

class Context7Claude {
  constructor() {
    this.c7Command = 'npx c7';
  }

  /**
   * Query documentation for a specific topic
   * @param {string} project - The project to query (e.g., 'react', 'nextjs')
   * @param {string} query - The query string
   * @param {Object} options - Query options
   * @returns {Promise<string>} - Query result
   */
  async query(project, query, options = {}) {
    const { format = 'txt', save = false, maxTokens = null } = options;
    
    let command = `${this.c7Command} ${project} "${query}"`;
    
    if (format === 'json') {
      command += ' -t json';
    }
    
    if (save) {
      command += ' --save';
    }
    
    if (maxTokens) {
      command += ` -k ${maxTokens}`;
    }
    
    try {
      const result = execSync(command, { encoding: 'utf-8' });
      return result;
    } catch (error) {
      console.error('Context7 query error:', error.message);
      throw error;
    }
  }

  /**
   * Search for available projects
   * @param {string} searchTerm - Term to search for
   * @returns {Promise<string>} - Search results
   */
  async search(searchTerm) {
    const command = `${this.c7Command} search ${searchTerm}`;
    
    try {
      const result = execSync(command, { encoding: 'utf-8' });
      return result;
    } catch (error) {
      console.error('Context7 search error:', error.message);
      throw error;
    }
  }

  /**
   * Get information about a specific project
   * @param {string} project - The project name
   * @returns {Promise<string>} - Project information
   */
  async getInfo(project) {
    const command = `${this.c7Command} info ${project}`;
    
    try {
      const result = execSync(command, { encoding: 'utf-8' });
      return result;
    } catch (error) {
      console.error('Context7 info error:', error.message);
      throw error;
    }
  }

  /**
   * Helper to get React-specific documentation
   * @param {string} topic - React topic to query
   * @returns {Promise<string>} - Documentation
   */
  async getReactDocs(topic) {
    return this.query('react', topic);
  }

  /**
   * Helper to get PostgreSQL documentation
   * @param {string} topic - PostgreSQL topic to query
   * @returns {Promise<string>} - Documentation
   */
  async getPostgresDocs(topic) {
    return this.query('postgresql', topic);
  }

  /**
   * Helper to get Tailwind CSS documentation
   * @param {string} topic - Tailwind topic to query
   * @returns {Promise<string>} - Documentation
   */
  async getTailwindDocs(topic) {
    return this.query('tailwindcss', topic);
  }

  /**
   * Helper to get Vite documentation
   * @param {string} topic - Vite topic to query
   * @returns {Promise<string>} - Documentation
   */
  async getViteDocs(topic) {
    return this.query('vite', topic);
  }

  /**
   * Get context for the current project's tech stack
   * @param {string} topic - General topic to search across all relevant projects
   * @returns {Promise<Object>} - Combined documentation results
   */
  async getProjectContext(topic) {
    const techStack = ['react', 'vite', 'tailwindcss', 'postgresql'];
    const results = {};
    
    for (const tech of techStack) {
      try {
        results[tech] = await this.query(tech, topic, { format: 'json' });
      } catch (error) {
        results[tech] = `No results found for ${tech}`;
      }
    }
    
    return results;
  }
}

export default new Context7Claude();