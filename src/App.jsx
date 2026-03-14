/**
 * src/App.jsx
 */

import { SearchBar }   from './components/SearchBar'
import { ResultsList } from './components/ResultsList'
import { useSearch }   from './hooks/useSearch'
import './App.css'

export default function App() {
  const { query, setQuery, available, taken, loading, error } = useSearch()

  return (
    <div className="app">
      <header className="app-header">
        <div className="logo">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="#050907"/>
            <rect x="6" y="11" width="20" height="14" rx="3" fill="none" stroke="#10d98a" strokeWidth="2"/>
            <circle cx="12" cy="17" r="2" fill="#10d98a"/>
            <circle cx="20" cy="17" r="2" fill="#10d98a"/>
            <path d="M12 22h8" stroke="#10d98a" strokeWidth="1.8" strokeLinecap="round"/>
            <line x1="16" y1="11" x2="16" y2="7" stroke="#10d98a" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="16" cy="6" r="1.5" fill="#10d98a"/>
          </svg>
          <span>Domain Bot</span>
        </div>
      </header>

      <main className="app-main">
        <h1 className="hero-title">Find your domain</h1>
        <p className="hero-sub">Instant availability across 14+ extensions</p>

        <SearchBar value={query} onChange={setQuery} loading={loading} />

        <ResultsList
          available={available}
          taken={taken}
          loading={loading}
          query={query}
          error={error}
        />
      </main>
    </div>
  )
}
