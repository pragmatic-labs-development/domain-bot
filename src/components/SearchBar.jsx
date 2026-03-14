/**
 * src/components/SearchBar.jsx
 */

import { useEffect, useRef } from 'react'

export function SearchBar({ value, onChange, loading }) {
  const inputRef = useRef(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  return (
    <div className="hero-search-wrap">
      <div className="hero-search-row">
        <input
          ref={inputRef}
          className="hero-input"
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="yourname.com"
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        />
        <button className="hero-search-btn" aria-label="Search">
          <SearchIcon loading={loading} />
          Search
        </button>
      </div>
      {value && (
        <div className="hero-search-bottom">
          <button className="clear-hint" onClick={() => onChange('')}>
            ✕ Clear
          </button>
        </div>
      )}
    </div>
  )
}

function SearchIcon({ loading }) {
  if (loading) return <div className="search-spinner" aria-label="Loading" />
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
    </svg>
  )
}
