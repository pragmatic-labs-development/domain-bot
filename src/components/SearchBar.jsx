/**
 * src/components/SearchBar.jsx
 * Supports variant="hero" (default) and variant="nav" (results page).
 */

import { useEffect, useRef } from 'react'

export function SearchBar({ value, onChange, onSearch, loading, variant = 'hero', primaryDomain, primaryResult }) {
  const inputRef = useRef(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  function handleKeyDown(e) {
    if (e.key === 'Enter' && value.trim()) onSearch()
    if (e.key === 'Escape') onChange('')
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
          placeholder="Search domains…"
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        />

        {primaryDomain && status && status !== 'checking' && (
          <div className="nav-status-line">
            <span className="nav-status-sep">·</span>
            {status === 'available' && (
              <span className="nav-status-text available">✓ Available</span>
            )}
            {status === 'taken' && (
              <>
                <span className="nav-status-text taken">✗ Taken</span>
                <a
                  className="nav-status-link"
                  href={`https://lookup.icann.org/en/lookup?name=${primaryDomain}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  WHOIS →
                </a>
              </>
            )}
          </div>
        )}

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
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      style={{ flexShrink: 0, color: 'var(--accent)', opacity: 0.8 }}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  )
}

function Spinner() {
  return <div className="search-spinner" aria-label="Loading" />
}

function NavSpinner() {
  return <div className="dns-spinner" style={{ width: 12, height: 12, borderWidth: 2 }} />
}
