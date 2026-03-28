/**
 * src/components/SearchBar.jsx
 * Supports variant="hero" (default) and variant="nav" (results page).
 */

import { useEffect, useRef, useState } from 'react'

export function SearchBar({ value, onChange, onSearch, loading, variant = 'hero', primaryDomain, primaryResult }) {
  const inputRef = useRef(null)
  const [showError, setShowError] = useState(false)

  useEffect(() => { inputRef.current?.focus() }, [])

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      if (value.trim()) { setShowError(false); onSearch() }
      else setShowError(true)
    }
    if (e.key === 'Escape') onChange('')
  }

  function handleSearch() {
    if (value.trim()) { setShowError(false); onSearch() }
    else setShowError(true)
  }

  if (variant === 'nav') {
    const status = primaryResult?.status
    return (
      <div className="nav-search-wrap">
        <NavSearchIcon />
        <input
          ref={inputRef}
          className="nav-search-input"
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="yourname.com"
          aria-label="Search for a domain name"
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        />
        <div className="nav-search-hints">
          {loading
            ? <NavSpinner />
            : <span className="esc-hint">Esc</span>
          }
          <NavShieldIcon />
        </div>
      </div>
    )
  }

  return (
    <div className="hero-search-wrap">
      <div className="hero-search-row">
        <input
          ref={inputRef}
          className="hero-input"
          type="text"
          value={value}
          onChange={e => { onChange(e.target.value); if (showError) setShowError(false) }}
          onKeyDown={handleKeyDown}
          placeholder="yourname.com"
          aria-label="Search for a domain name"
          aria-describedby={showError ? 'search-error' : undefined}
          aria-invalid={showError || undefined}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        />
        <button
          className="hero-search-btn"
          onClick={handleSearch}
          aria-label="Search"
        >
          {loading ? <Spinner /> : <SearchIcon />}
          Search
        </button>
      </div>
      <div className="hero-search-bottom">
        {showError && (
          <span id="search-error" className="search-error" role="alert">
            Please enter a domain name
          </span>
        )}
        {!showError && value && (
          <button className="clear-hint" onClick={() => onChange('')}>✕ Clear</button>
        )}
      </div>
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

function NavSearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0, color: 'var(--text-muted)' }}>
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
    </svg>
  )
}

function NavShieldIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"
      style={{ flexShrink: 0, color: 'var(--accent)', opacity: 0.9 }}>
      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
      <path d="M10.5 14.5l-2.5-2.5 1.06-1.06 1.44 1.44 3.44-3.44 1.06 1.06z" fill="var(--bg)" stroke="none"/>
    </svg>
  )
}

function Spinner() {
  return <div className="search-spinner" aria-label="Loading" />
}

function NavSpinner() {
  return <div className="dns-spinner" style={{ width: 12, height: 12, borderWidth: 2 }} />
}
