/**
 * src/components/ResultsView.jsx
 * Primary domain card + Basic/Advanced tabs with filters.
 */

import { useState, useMemo } from 'react'
import { PrimaryDomainCard } from './PrimaryDomainCard'
import { DomainCard }        from './DomainCard'
import { DomainRow }         from './DomainRow'
import { botScore, getLowestPrice } from '../lib/pricing'

const QUICK_FILTERS = [
  { id: 'all-tlds', label: 'All' },
  { id: 'popular',  label: 'Popular' },
  { id: 'business', label: 'Business' },
  { id: 'tech',     label: 'Tech' },
  { id: 'startup',  label: 'Startup' },
  { id: 'creative', label: 'Creative' },
  { id: 'short',    label: 'Short' },
  { id: 'cheap',    label: 'Cheap' },
]

const BUSINESS_TLDS  = ['com','net','org','co','biz','inc','ltd','company','business','services','consulting','agency']
const TECH_TLDS      = ['io','dev','app','ai','tech','cloud','software','digital','codes','systems','network','tools','build','run','engineering']
const STARTUP_TLDS   = ['ai','co','io','vc','app','so','ly','to','sh','gg','cc']
const CREATIVE_TLDS  = ['design','studio','art','media','photography','ink','gallery','graphics','style','video','film','music','xyz','fun','lol','cool','rocks','ninja','wtf','buzz']

const ADV_STATUSES = ['available','premium','aftermarket','taken','unknown']

export function ResultsView({ keyword, primaryDomain, results, livePrices, loading, wave3Available, onLoadWave3, onLiveCheck }) {
  const [mainTab,      setMainTab]      = useState('basic')
  const [quickFilter,  setQuickFilter]  = useState('all-tlds')
  const [advFilters,   setAdvFilters]   = useState(new Set(ADV_STATUSES))
  const [saved,        setSaved]        = useState(() => JSON.parse(localStorage.getItem('db-saved') || '[]'))

  function toggleSave(domain) {
    setSaved(prev => {
      const next = prev.includes(domain) ? prev.filter(d => d !== domain) : [...prev, domain]
      localStorage.setItem('db-saved', JSON.stringify(next))
      return next
    })
  }

  // Convert results object to arrays
  const allEntries = useMemo(() => Object.entries(results).map(([domain, r]) => ({ domain, ...r })), [results])

  const primaryResult = results[primaryDomain]

  // Basic tab: available + premium domains, apply quick filter
  const availableEntries = useMemo(() =>
    allEntries.filter(e => e.status === 'available' || e.status === 'premium'),
    [allEntries]
  )

  const basicItems = useMemo(() => {
    let items = availableEntries
    const tld = d => d.domain.split('.').slice(1).join('.')
    const kw  = d => d.domain.split('.')[0]
    switch (quickFilter) {
      case 'popular':   return [...items].sort((a, b) => botScore(b.domain, livePrices) - botScore(a.domain, livePrices)).slice(0, 18)
      case 'business':  return items.filter(d => BUSINESS_TLDS.includes(tld(d)))
      case 'tech':      return items.filter(d => TECH_TLDS.includes(tld(d)))
      case 'startup':   return items.filter(d => STARTUP_TLDS.includes(tld(d)) || kw(d).length <= 7)
      case 'creative':  return items.filter(d => CREATIVE_TLDS.includes(tld(d)))
      case 'short':     return items.filter(d => kw(d).length <= 6)
      case 'cheap':     return [...items].sort((a, b) => getLowestPrice(a.domain, livePrices) - getLowestPrice(b.domain, livePrices))
      default:          return items
    }
  }, [availableEntries, quickFilter, livePrices])

  // Advanced tab: all statuses, apply filter checkboxes
  const advItems = useMemo(() =>
    allEntries.filter(e => advFilters.has(e.status)),
    [allEntries, advFilters]
  )

  function toggleAdvFilter(status) {
    setAdvFilters(prev => {
      const next = new Set(prev)
      if (next.has(status)) next.delete(status)
      else next.add(status)
      return next
    })
  }

  const checkingCount  = allEntries.filter(e => e.status === 'checking').length
  const availableCount = availableEntries.length
  const advCount       = advItems.length

  if (!keyword) return null

  return (
    <div className="results-view">
      <PrimaryDomainCard
        domain={primaryDomain}
        result={primaryResult}
        livePrices={livePrices}
        onLiveCheck={onLiveCheck}
      />

      {/* Main tab bar */}
      <div className="main-tab-bar">
        <button
          className={`main-tab ${mainTab === 'basic' ? 'active' : ''}`}
          onClick={() => setMainTab('basic')}
        >
          Basic <span className="main-tab-count">{availableCount}</span>
        </button>
        <button
          className={`main-tab ${mainTab === 'advanced' ? 'active' : ''}`}
          onClick={() => setMainTab('advanced')}
        >
          Advanced <span className="main-tab-count">{advCount}</span>
        </button>
        {loading && checkingCount > 0 && (
          <span className="tab-checking-hint">
            <span className="dns-spinner" style={{ width: 10, height: 10, borderWidth: 2 }} />
            Checking {checkingCount} more…
          </span>
        )}
      </div>

      {/* Basic panel */}
      {mainTab === 'basic' && (
        <div className="basic-panel">
          <div className="quick-filters">
            {QUICK_FILTERS.map(f => (
              <button
                key={f.id}
                className={`qf-pill ${quickFilter === f.id ? 'active' : ''}`}
                onClick={() => setQuickFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>

          {basicItems.length === 0 && !loading && (
            <div className="tab-empty">No available domains match this filter yet.</div>
          )}
          {basicItems.length === 0 && loading && (
            <div className="cards-grid">
              {Array.from({ length: 8 }).map((_, i) => <div key={i} className="ghost-card" />)}
            </div>
          )}
          {basicItems.length > 0 && (
            <div className="cards-grid">
              {basicItems.map((e, i) => (
                <DomainCard
                  key={e.domain}
                  domain={e.domain}
                  result={e}
                  livePrices={livePrices}
                  saved={saved.includes(e.domain)}
                  onSave={toggleSave}
                  index={i}
                />
              ))}
            </div>
          )}

          {wave3Available && (
            <div className="load-more-wrap">
              <button className="load-more-btn" onClick={onLoadWave3}>
                <PlusIcon /> Load more TLDs
              </button>
            </div>
          )}
        </div>
      )}

      {/* Advanced panel */}
      {mainTab === 'advanced' && (
        <div className="advanced-panel">
          <div className="adv-filter-bar">
            <span className="adv-filter-label">Show:</span>
            {[
              { id: 'available',   label: 'Available',   color: 'var(--green)' },
              { id: 'premium',     label: 'Premium',     color: 'var(--yellow)' },
              { id: 'aftermarket', label: 'Aftermarket', color: 'var(--blue)' },
              { id: 'taken',       label: 'Taken',       color: 'var(--red)' },
              { id: 'unknown',     label: 'Unknown',     color: 'var(--text-muted)' },
            ].map(f => (
              <button
                key={f.id}
                className={`adv-check-pill ${advFilters.has(f.id) ? 'checked' : ''}`}
                style={{ '--adv-color': f.color }}
                onClick={() => toggleAdvFilter(f.id)}
              >
                <span className="adv-check-icon">{advFilters.has(f.id) ? '✓' : ''}</span>
                <span className="adv-dot" style={{ background: f.color }} />
                {f.label}
              </button>
            ))}
          </div>

          {advItems.length === 0 && (
            <div className="tab-empty">No results match the selected filters.</div>
          )}
          <div className="rows-list">
            {advItems.map((e, i) => (
              <DomainRow
                key={e.domain}
                domain={e.domain}
                result={e}
                livePrices={livePrices}
                saved={saved.includes(e.domain)}
                onSave={toggleSave}
                onLiveCheck={onLiveCheck}
                index={i}
              />
            ))}
          </div>

          {wave3Available && (
            <div className="load-more-wrap">
              <button className="load-more-btn" onClick={onLoadWave3}>
                <PlusIcon /> Load more TLDs
              </button>
            </div>
          )}
        </div>
      )}

      <p className="dns-note">
        <InfoIcon /> Availability data via DNS lookup · Click <strong>Live check</strong> on any domain for authoritative data + real pricing.
      </p>
    </div>
  )
}

function PlusIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
    </svg>
  )
}
function InfoIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
    </svg>
  )
}
