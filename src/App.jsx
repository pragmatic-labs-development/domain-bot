/**
 * src/App.jsx
 */

import { useState, useEffect, useRef } from 'react'
import { SearchBar }   from './components/SearchBar'
import { ResultsView } from './components/ResultsView'
import { SavedPanel }  from './components/SavedPanel'
import { useSearch }   from './hooks/useSearch'
import './App.css'

export default function App() {
  const [inputValue,    setInputValue]    = useState('')
  const [savedOpen,     setSavedOpen]     = useState(false)
  const [ideasOpen,     setIdeasOpen]     = useState(false)
  const [ideasKw,       setIdeasKw]       = useState('')
  const [detailDomain,  setDetailDomain]  = useState(null)
  const [mainTab,       setMainTab]       = useState('domains')
  const [savedStatuses, setSavedStatuses] = useState(() =>
    JSON.parse(localStorage.getItem('db-saved-statuses') || '{}')
  )
  const [saved,      setSaved]      = useState(() =>
    JSON.parse(localStorage.getItem('db-saved') || '[]')
  )

  const {
    keyword, primaryDomain, results, livePrices, healthData,
    loading, wave3Available,
    triggerSearch, loadWave3, checkLive, loadHealth,
  } = useSearch()

  function handleSearch() {
    if (inputValue.trim()) {
      setIdeasKw('')
      triggerSearch(inputValue.trim())
    }
  }

  function toggleSave(domain) {
    // Capture status at save time so the saved panel has colors immediately
    if (!savedStatuses[domain] && results[domain]) {
      setSavedStatuses(prev => {
        const next = { ...prev, [domain]: results[domain] }
        localStorage.setItem('db-saved-statuses', JSON.stringify(next))
        return next
      })
    }
    setSaved(prev => {
      const next = prev.includes(domain)
        ? prev.filter(d => d !== domain)
        : [...prev, domain]
      localStorage.setItem('db-saved', JSON.stringify(next))
      return next
    })
  }

  const hasResults = keyword && Object.keys(results).length > 0

  // Persist statuses for saved domains whenever results update
  useEffect(() => {
    const updates = {}
    saved.forEach(domain => {
      if (results[domain]) updates[domain] = results[domain]
    })
    if (Object.keys(updates).length === 0) return
    setSavedStatuses(prev => {
      const next = { ...prev, ...updates }
      localStorage.setItem('db-saved-statuses', JSON.stringify(next))
      return next
    })
  }, [results])

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

          {hasResults && (
            <div className="nav-links">
              <button
                className={`nav-link ${mainTab === 'domains' || mainTab === 'advanced' ? 'active' : ''}`}
                onClick={() => setMainTab('domains')}
              >
                Search
              </button>
              <button
                className={`nav-link ${mainTab === 'other-ideas' ? 'active' : ''}`}
                onClick={() => setMainTab('other-ideas')}
              >
                Ideas
              </button>
            </div>
          )}

          <div className="nav-right">
            <button
              className="nav-wand-btn"
              onClick={() => setIdeasOpen(true)}
              aria-label="Generate new idea"
            >
              <WandIcon />
              Generate New Idea
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
          <h1>Check domain availability<br />without being tracked</h1>

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
        <div id="main-content" className="results-wrapper">
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
            ideasKw={ideasKw}
            detailDomain={detailDomain}
            onDetail={setDetailDomain}
            mainTab={mainTab}
            onTabChange={setMainTab}
          />
        </div>
      )}

      {savedOpen && (
        <SavedPanel
          saved={saved}
          onUnsave={toggleSave}
          onClose={() => setSavedOpen(false)}
          livePrices={livePrices}
          results={savedStatuses}
          onLiveCheck={checkLive}
          onDetail={domain => { setSavedOpen(false); setDetailDomain(domain) }}
        />
      )}

      {ideasOpen && (
        <IdeasModal
          onClose={() => setIdeasOpen(false)}
          onSubmit={kw => {
            setIdeasKw(kw)
            setInputValue(kw)
            setIdeasOpen(false)
            triggerSearch(kw)
          }}
        />
      )}
    </div>
  )
}

function IdeasModal({ onClose, onSubmit }) {
  const [value, setValue] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  function handleSubmit() {
    const kw = value.trim().toLowerCase().replace(/[^a-z0-9-]/g, '')
    if (kw) onSubmit(kw)
  }

  return (
    <div className="ideas-modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="ideas-modal">
        <div className="ideas-modal-header">
          <WandIcon />
          <span>Generate name ideas</span>
        </div>
        <p className="ideas-modal-sub">Enter a word or concept — we'll find 20 available domain variations.</p>
        <div className="ideas-modal-row">
          <input
            ref={inputRef}
            className="ideas-modal-input"
            type="text"
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }}
            placeholder="e.g. spark, bloom, atlas…"
            spellCheck={false}
            autoComplete="off"
          />
          <button
            className="ideas-modal-btn"
            onClick={handleSubmit}
            disabled={!value.trim()}
          >
            Generate
          </button>
        </div>
      </div>
    </div>
  )
}

function WandIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z"/>
      <path d="m14 7 3 3"/>
      <path d="M5 6v4M19 14v4M10 2v2M7 8H3M21 16h-4M11 3H9"/>
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
