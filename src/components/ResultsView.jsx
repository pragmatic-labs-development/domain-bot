/**
 * src/components/ResultsView.jsx
 * Primary domain card + Basic/Advanced tabs with filters + sort.
 */

import { useState, useMemo, useEffect } from 'react'
import { PrimaryDomainCard } from './PrimaryDomainCard'
import { DomainCard }        from './DomainCard'
import { DomainRow }         from './DomainRow'
import { DomainModal }       from './DomainModal'
import { botScore, getLowestPrice, seoScore } from '../lib/pricing'

const QUICK_FILTERS = [
  { id: 'all-tlds', label: 'All',      icon: <GlobeIcon /> },
  { id: 'popular',  label: 'Popular',  icon: <StarIcon /> },
  { id: 'business', label: 'Business', icon: <BriefcaseIcon /> },
  { id: 'tech',     label: 'Tech',     icon: <CodeIcon /> },
  { id: 'startup',  label: 'Startup',  icon: <LightningIcon /> },
  { id: 'creative', label: 'Creative', icon: <PencilIcon /> },
  { id: 'short',    label: 'Short',    icon: <ArrowIcon /> },
  { id: 'cheap',    label: 'Cheap',    icon: <DollarIcon /> },
]

const SORT_OPTIONS = [
  { id: 'seo-desc',   label: 'SEO Score' },
  { id: 'bot-desc',   label: 'Bot Score' },
  { id: 'price-asc',  label: 'Price: Low–High' },
  { id: 'price-desc', label: 'Price: High–Low' },
  { id: 'alpha',      label: 'Alphabetical' },
]

const BUSINESS_TLDS  = ['com','net','org','co','biz','inc','ltd','company','business','services','consulting','agency']
const TECH_TLDS      = ['io','dev','app','ai','tech','cloud','software','digital','codes','systems','network','tools','build','run','engineering']
const STARTUP_TLDS   = ['ai','co','io','vc','app','so','ly','to','sh','gg','cc']
const CREATIVE_TLDS  = ['design','studio','art','media','photography','ink','gallery','graphics','style','video','film','music','xyz','fun','lol','cool','rocks','ninja','wtf','buzz']

const ADV_STATUSES = ['available','premium','aftermarket','taken','unknown']

export function ResultsView({ keyword, primaryDomain, results, livePrices, loading, wave3Available, onLoadWave3, onLiveCheck, saved = [], onSave }) {
  const [mainTab,      setMainTab]      = useState('basic')
  const [quickFilter,  setQuickFilter]  = useState('all-tlds')
  const [sortId,       setSortId]       = useState('seo-desc')
  const [sortOpen,     setSortOpen]     = useState(false)
  const [advFilters,   setAdvFilters]   = useState(new Set(ADV_STATUSES))
  const [detailDomain, setDetailDomain] = useState(null)
  const [visibleCount, setVisibleCount] = useState(30)

  // Reset pagination whenever filter or sort changes
  useEffect(() => { setVisibleCount(30) }, [quickFilter, sortId])
  // Also reset when new search fires
  useEffect(() => { setVisibleCount(30) }, [keyword])

  function toggleSave(domain) {
    onSave?.(domain)
  }

  const allEntries = useMemo(() => Object.entries(results).map(([domain, r]) => ({ domain, ...r })), [results])
  const primaryResult = results[primaryDomain]

  // Sort function
  function applySort(items) {
    const sorted = [...items]
    switch (sortId) {
      case 'price-asc':  return sorted.sort((a, b) => getLowestPrice(a.domain, livePrices) - getLowestPrice(b.domain, livePrices))
      case 'price-desc': return sorted.sort((a, b) => getLowestPrice(b.domain, livePrices) - getLowestPrice(a.domain, livePrices))
      case 'seo-desc':   return sorted.sort((a, b) => seoScore(b.domain) - seoScore(a.domain))
      case 'bot-desc':   return sorted.sort((a, b) => botScore(b.domain, livePrices) - botScore(a.domain, livePrices))
      case 'alpha':      return sorted.sort((a, b) => a.domain.localeCompare(b.domain))
      default:           return sorted
    }
  }

  // Basic tab: available + premium, filtered + sorted
  const availableEntries = useMemo(() =>
    allEntries.filter(e => e.status === 'available' || e.status === 'premium'),
    [allEntries]
  )

  const basicItems = useMemo(() => {
    const tld = d => d.domain.split('.').slice(1).join('.')
    const kw  = d => d.domain.split('.')[0]
    let items = availableEntries
    switch (quickFilter) {
      case 'popular':  items = [...items].sort((a, b) => botScore(b.domain, livePrices) - botScore(a.domain, livePrices)).slice(0, 18); break
      case 'business': items = items.filter(d => BUSINESS_TLDS.includes(tld(d))); break
      case 'tech':     items = items.filter(d => TECH_TLDS.includes(tld(d))); break
      case 'startup':  items = items.filter(d => STARTUP_TLDS.includes(tld(d)) || kw(d).length <= 7); break
      case 'creative': items = items.filter(d => CREATIVE_TLDS.includes(tld(d))); break
      case 'short':    items = items.filter(d => kw(d).length <= 6); break
      case 'cheap':    break // sort handles it
    }
    return quickFilter === 'popular' ? items : applySort(items)
  }, [availableEntries, quickFilter, sortId, livePrices])

  // Advanced tab: all statuses, filtered + sorted
  const advItems = useMemo(() =>
    applySort(allEntries.filter(e => advFilters.has(e.status))),
    [allEntries, advFilters, sortId, livePrices]
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
  const currentSort    = SORT_OPTIONS.find(s => s.id === sortId)

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
        <div className="main-tabs">
          <button
            className={`main-tab ${mainTab === 'basic' ? 'active' : ''}`}
            onClick={() => setMainTab('basic')}
          >
            Basic <span className="tab-count">{availableCount}</span>
          </button>
          <button
            className={`main-tab ${mainTab === 'advanced' ? 'active' : ''}`}
            onClick={() => setMainTab('advanced')}
          >
            Advanced <span className="tab-count">{advCount}</span>
          </button>
          {loading && checkingCount > 0 && (
            <span className="tab-checking-hint">
              <span className="dns-spinner" style={{ width: 10, height: 10, borderWidth: 2 }} />
              Checking {checkingCount} more…
            </span>
          )}
        </div>

        {/* Sort dropdown */}
        <div className="sort-wrap">
          <button className="sort-btn" onClick={() => setSortOpen(o => !o)}>
            <SortIcon />
            Sort <span className="sort-label">{currentSort?.label}</span>
            <ChevronIcon />
          </button>
          {sortOpen && (
            <div className="sort-dropdown">
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  className={`sort-option ${sortId === opt.id ? 'active' : ''}`}
                  onClick={() => { setSortId(opt.id); setSortOpen(false) }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
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
                {f.icon}{f.label}
              </button>
            ))}
          </div>

          {basicItems.length === 0 && !loading && (
            <div className="tab-empty">No available domains match this filter yet.</div>
          )}
          {basicItems.length === 0 && loading && (
            <div className="cards-grid">
              {Array.from({ length: 30 }).map((_, i) => <div key={i} className="ghost-card" />)}
            </div>
          )}
          {basicItems.length > 0 && (() => {
            const visible   = basicItems.slice(0, visibleCount)
            const remaining = basicItems.length - visibleCount
            const nextBatch = Math.min(remaining, 30)
            return (
              <>
                <div className="cards-grid">
                  {visible.map((e, i) => (
                    <DomainCard
                      key={e.domain}
                      domain={e.domain}
                      result={e}
                      livePrices={livePrices}
                      saved={saved.includes(e.domain)}
                      onSave={toggleSave}
                      onDetail={setDetailDomain}
                      index={i}
                    />
                  ))}
                </div>

                {(remaining > 0 || wave3Available) && (
                  <div className="load-more-wrap">
                    {remaining > 0 && (
                      <button
                        className="load-more-btn"
                        onClick={() => setVisibleCount(v => v + 30)}
                      >
                        <PlusCircleIcon /> Show {nextBatch} more
                        <span className="load-more-total">{remaining} remaining</span>
                      </button>
                    )}
                    {remaining === 0 && wave3Available && (
                      <button className="load-more-btn" onClick={onLoadWave3}>
                        <PlusCircleIcon /> Load more TLDs
                      </button>
                    )}
                  </div>
                )}
              </>
            )
          })()}
        </div>
      )}

      {/* Advanced panel */}
      {mainTab === 'advanced' && (
        <div className="advanced-panel">
          <div className="adv-filter-bar">
            <span className="adv-filter-label">SHOW:</span>
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
                onDetail={setDetailDomain}
                index={i}
              />
            ))}
          </div>

          {wave3Available && (
            <div className="load-more-wrap">
              <button className="load-more-btn" onClick={onLoadWave3}>
                <PlusCircleIcon /> Load more TLDs
              </button>
            </div>
          )}
        </div>
      )}

      <p className="dns-note">
        <InfoIcon /> Availability via DNS lookup · Click <strong>Live check</strong> on any domain for authoritative data + real pricing.
      </p>

      {detailDomain && (
        <DomainModal
          domain={detailDomain}
          result={results[detailDomain]}
          livePrices={livePrices}
          saved={saved.includes(detailDomain)}
          onSave={toggleSave}
          onClose={() => setDetailDomain(null)}
        />
      )}
    </div>
  )
}

/* ── Icons ── */
function GlobeIcon()     { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg> }
function StarIcon()      { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> }
function BriefcaseIcon() { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg> }
function CodeIcon()      { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg> }
function LightningIcon() { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> }
function PencilIcon()    { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg> }
function ArrowIcon()     { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg> }
function DollarIcon()    { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> }
function SortIcon()      { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><line x1="21" y1="10" x2="7" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="7" y2="18"/></svg> }
function ChevronIcon()   { return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m6 9 6 6 6-6"/></svg> }
function PlusCircleIcon(){ return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg> }
function InfoIcon()      { return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg> }
