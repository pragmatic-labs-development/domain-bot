/**
 * src/components/SearchBar.jsx
 */

import { useEffect, useRef } from 'react'

export function SearchBar({ value, onChange, loading }) {
  const inputRef = useRef(null)

  // Auto-focus on mount
  useEffect(() => { inputRef.current?.focus() }, [])

  return (
    <div className="search-bar">
      <SearchIcon />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Search a domain name…"
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
      />
      {loading && <Spinner />}
      {!loading && value && (
        <button className="clear-btn" onClick={() => onChange('')} aria-label="Clear">
          ✕
        </button>
      )}
    </div>
  )
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function Spinner() {
  return <div className="spinner" aria-label="Loading" />
}
