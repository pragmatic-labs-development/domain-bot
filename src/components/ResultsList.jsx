/**
 * src/components/ResultsList.jsx
 */

import { DomainCard } from './DomainCard'

export function ResultsList({ available, taken, loading, query, error }) {
  if (error) {
    return <div className="state-msg error">Error: {error}</div>
  }

  if (!query) {
    return (
      <div className="state-msg hint">
        Type a name above to check domain availability.
      </div>
    )
  }

  if (loading && available.length === 0 && taken.length === 0) {
    return (
      <div className="results-grid skeleton-grid">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="domain-card skeleton" />
        ))}
      </div>
    )
  }

  if (!loading && available.length === 0 && taken.length === 0) {
    return <div className="state-msg">No results found.</div>
  }

  return (
    <div className="results-section">
      {available.length > 0 && (
        <>
          <h2 className="section-heading">
            Available <span className="count">{available.length}</span>
          </h2>
          <div className="results-grid">
            {available.map(r => <DomainCard key={r.domain} result={r} />)}
          </div>
        </>
      )}

      {taken.length > 0 && (
        <>
          <h2 className="section-heading muted">
            Taken <span className="count">{taken.length}</span>
          </h2>
          <div className="results-grid">
            {taken.map(r => <DomainCard key={r.domain} result={r} />)}
          </div>
        </>
      )}
    </div>
  )
}
