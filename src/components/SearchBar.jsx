/**
 * src/components/SearchBar.jsx
 * Search is triggered explicitly via Enter or the Search button.
 * Prefetches top 3 TLDs while user is typing (400ms debounce).
 */

import { useEffect, useRef } from 'react'

export function SearchBar({ value, onChange, onSearch, loading }) {
  const inputRef   = useRef(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  function handleKeyDown(e) {
    if (e.key === 'Enter' && value.trim()) onSearch()
  }

  return (
    <div className="hero-search-wrap">
      <div className="hero-search-row">
        <input
          ref={inputRef}
          className="hero-input"
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="yourname.com"
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        />
        <button
          className="hero-search-btn"
          onClick={() => value.trim() && onSearch()}
          aria-label="Search"
        >
          {loading ? <Spinner /> : <SearchIcon />}
          Search
        </button>
      </div>
      {value && (
        <div className="hero-search-bottom">
          <button className="clear-hint" onClick={() => onChange('')}>✕ Clear</button>
        </div>
      )}
    </div>
  )
}

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
    </svg>
  )
}

function Spinner() {
  return <div className="search-spinner" aria-label="Loading" />
}
