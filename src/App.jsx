/**
 * src/App.jsx
 */

import { SearchBar }   from './components/SearchBar'
import { ResultsList } from './components/ResultsList'
import { useSearch }   from './hooks/useSearch'
import './App.css'

export default function App() {
  const { query, setQuery, available, taken, loading, error } = useSearch()
  const hasResults = available.length > 0 || taken.length > 0 || loading

  return (
    <div className="app">
      <nav className="app-header">
        <a className="nav-logo" href="#">
          <img src="/Domain-Bot-Logo.svg" width="44" height="37" alt="Domain Bot" />
        </a>

        <div className="nav-right">
          <span className="api-status-dot api-dns">
            <svg width="9" height="9" viewBox="0 0 12 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <rect x="1.5" y="6" width="9" height="7" rx="1.5"/>
              <path d="M3.5 6V4a2.5 2.5 0 015 0v2"/>
            </svg>
            <span>Private Search</span>
          </span>
          <button className="icon-btn" aria-label="Saved domains">★</button>
        </div>
      </nav>

      <section id="hero">
        <p className="hero-eyebrow">Domain Availability Search</p>
        <h1>Check domain availability<br/>without being tracked</h1>

        <div className="hero-search-group">
          <SearchBar value={query} onChange={setQuery} loading={loading} />

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

      {hasResults && (
        <div className="results-wrapper">
          <ResultsList
            available={available}
            taken={taken}
            loading={loading}
            query={query}
            error={error}
          />
        </div>
      )}
    </div>
  )
}
