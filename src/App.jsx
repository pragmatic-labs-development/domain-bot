/**
 * src/App.jsx
 */

import { useState, useEffect } from 'react'
import { SearchBar }   from './components/SearchBar'
import { ResultsView } from './components/ResultsView'
import { SavedPanel }  from './components/SavedPanel'
import { useSearch }   from './hooks/useSearch'
import './App.css'

export default function App() {
  const [inputValue, setInputValue] = useState('')
  const [savedOpen,  setSavedOpen]  = useState(false)
  const [saved,      setSaved]      = useState(() =>
    JSON.parse(localStorage.getItem('db-saved') || '[]')
  )

  const {
    keyword, primaryDomain, results, livePrices, healthData,
    loading, wave3Available,
    triggerSearch, loadWave3, checkLive, loadHealth,
  } = useSearch()

  function handleSearch() {
    if (inputValue.trim()) triggerSearch(inputValue.trim())
  }

  function toggleSave(domain) {
    setSaved(prev => {
      const next = prev.includes(domain)
        ? prev.filter(d => d !== domain)
        : [...prev, domain]
      localStorage.setItem('db-saved', JSON.stringify(next))
      return next
    })
  }

  const hasResults = keyword && Object.keys(results).length > 0

  useEffect(() => {
    if (hasResults) window.scrollTo({ top: 0, behavior: 'instant' })
  }, [keyword])

  useEffect(() => {
    document.body.style.overflow = savedOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [savedOpen])

  return (
    <div className="app">
      <nav className={`app-header ${hasResults ? 'header-results' : ''}`}>
        <div className="nav-top-row">
          <a className="nav-logo" href="/" aria-label="Domain Bot home">
            <img src="/Domain-Bot-Logo.svg" width="44" height="37" alt="Domain Bot" />
          </a>

          {hasResults && (
            <SearchBar
              value={inputValue}
              onChange={setInputValue}
              onSearch={handleSearch}
              loading={loading}
              variant="nav"
              primaryDomain={primaryDomain}
              primaryResult={results[primaryDomain]}
            />
          )}

          <div className="nav-right">
            <button
              className="icon-btn"
              onClick={() => { setInputValue(''); document.querySelector('.hero-input, .nav-search-input')?.focus() }}
              aria-label="Generate domain ideas"
              title="Generate ideas"
            >
              <WandIcon />
            </button>

            <button
              className={`icon-btn saved-nav-btn ${saved.length > 0 ? 'has-saved' : ''}`}
              aria-label="Saved domains"
              onClick={() => setSavedOpen(true)}
            >
              <BookmarkNavIcon filled={saved.length > 0} />
              {saved.length > 0 && (
                <span className="saved-nav-count">{saved.length}</span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {!hasResults && (
        <section id="hero">
          <p className="hero-eyebrow">Domain Availability Search</p>
          <h1>Check domain availability<br/>without being tracked</h1>

          <div className="hero-search-group">
            <SearchBar
              value={inputValue}
              onChange={setInputValue}
              onSearch={handleSearch}
              loading={loading}
            />

            <div className="trust-banner">
              <div className="trust-banner-header">HOW WE PROTECT YOUR IDEAS</div>
              <div className="trust-banner-items">
                <div className="trust-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                  Never buys or reserves domains
                </div>
                <div className="trust-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <rect x="3" y="11" width="18" height="11" rx="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  Your searches stay private
                </div>
                <div className="trust-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  No tracking, no ad targeting
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {hasResults && (
        <div className="results-wrapper">
          <ResultsView
            keyword={keyword}
            primaryDomain={primaryDomain}
            results={results}
            livePrices={livePrices}
            healthData={healthData}
            loading={loading}
            wave3Available={wave3Available}
            onLoadWave3={loadWave3}
            onLiveCheck={checkLive}
            onLoadHealth={loadHealth}
            saved={saved}
            onSave={toggleSave}
          />
        </div>
      )}

      {savedOpen && (
        <SavedPanel
          saved={saved}
          onUnsave={toggleSave}
          onClose={() => setSavedOpen(false)}
          livePrices={livePrices}
        />
      )}
    </div>
  )
}

function WandIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 4V2m0 14v-2M8 9h2m10 0h2M17.8 6.2l-1.4 1.4M13.4 10.6l-1.4 1.4M4 20l9-9"/>
      <path d="M13 4l1.5 3.5L18 9l-3.5 1.5L13 14l-1.5-3.5L8 9l3.5-1.5z"/>
    </svg>
  )
}

function BookmarkNavIcon({ filled }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
    </svg>
  )
}
