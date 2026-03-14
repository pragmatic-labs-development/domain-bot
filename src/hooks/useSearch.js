/**
 * src/hooks/useSearch.js
 *
 * Handles debounced search, state management, and abort on new queries.
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { suggestDomains } from '../lib/api'

const DEFAULT_TLDS = [
  'com', 'net', 'org', 'io', 'ai', 'app', 'co', 'dev',
  'xyz', 'tech', 'shop', 'store', 'online', 'site',
]

const DEBOUNCE_MS = 400

export function useSearch() {
  const [query, setQuery]     = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  // Track the current query so stale responses don't overwrite newer ones
  const currentQuery = useRef('')
  const timer        = useRef(null)

  const search = useCallback((q) => {
    const clean = q.trim().toLowerCase().replace(/[^a-z0-9-]/g, '')
    currentQuery.current = clean

    clearTimeout(timer.current)
    setError(null)

    if (!clean) {
      setResults([])
      setLoading(false)
      return
    }

    setLoading(true)

    timer.current = setTimeout(async () => {
      try {
        const data = await suggestDomains(clean, DEFAULT_TLDS)
        // Only apply if the query hasn't changed while we were fetching
        if (currentQuery.current === clean) {
          setResults(data)
          setLoading(false)
        }
      } catch (err) {
        if (currentQuery.current === clean) {
          setError(err.message)
          setLoading(false)
        }
      }
    }, DEBOUNCE_MS)
  }, [])

  // Kick off search whenever query changes
  useEffect(() => {
    search(query)
    return () => clearTimeout(timer.current)
  }, [query, search])

  // Derived
  const available = results.filter(r => r.available)
  const taken     = results.filter(r => !r.available)

  return {
    query, setQuery,
    results, available, taken,
    loading, error,
  }
}
