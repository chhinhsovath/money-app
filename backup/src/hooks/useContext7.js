import { useState, useCallback } from 'react';
import context7Claude from '@/utils/context7-claude';

/**
 * React hook for Context7 integration
 * Provides easy access to documentation queries within React components
 */
export function useContext7() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);

  const query = useCallback(async (project, queryString, options = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await context7Claude.query(project, queryString, options);
      setResults(result);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const search = useCallback(async (searchTerm) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await context7Claude.search(searchTerm);
      setResults(result);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getInfo = useCallback(async (project) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await context7Claude.getInfo(project);
      setResults(result);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getProjectContext = useCallback(async (topic) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await context7Claude.getProjectContext(topic);
      setResults(result);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults(null);
    setError(null);
  }, []);

  return {
    query,
    search,
    getInfo,
    getProjectContext,
    clearResults,
    loading,
    error,
    results,
    // Direct access to specific documentation helpers
    getReactDocs: useCallback((topic) => query('react', topic), [query]),
    getPostgresDocs: useCallback((topic) => query('postgresql', topic), [query]),
    getTailwindDocs: useCallback((topic) => query('tailwindcss', topic), [query]),
    getViteDocs: useCallback((topic) => query('vite', topic), [query]),
  };
}