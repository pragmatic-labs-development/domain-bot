/**
 * src/components/ResultsView.jsx
 * Primary domain card + Basic/Advanced tabs with filters + sort.
 */

import { useState, useMemo, useEffect, useCallback } from 'react'
import { DomainCard }        from './DomainCard'
import { DomainRow }         from './DomainRow'
import { DomainModal }       from './DomainModal'
import { DomainsView }       from './DomainsView'
import { OtherIdeasView }    from './OtherIdeasView'
import { getLowestPrice, seoScore } from '../lib/pricing'
// import { botScore } from '../lib/pricing'  // Bot score hidden for now

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
  // { id: 'bot-desc',   label: 'Bot Score' },
  { id: 'price-asc',  label: 'Price: Low–High' },
  { id: 'price-desc', label: 'Price: High–Low' },
  { id: 'alpha',      label: 'Alphabetical' },
]

const BUSINESS_TLDS  = ['com','net','org','co','biz','inc','ltd','company','business','services','consulting','agency']
const TECH_TLDS      = ['io','dev','app','ai','tech','cloud','software','digital','codes','systems','network','tools','build','run','engineering']
const STARTUP_TLDS   = ['ai','co','io','vc','app','so','ly','to','sh','gg','cc']
const CREATIVE_TLDS  = ['design','studio','art','media','photography','ink','gallery','graphics','style','video','film','music','xyz','fun','lol','cool','rocks','ninja','wtf','buzz']

const ADV_STATUSES = ['available','premium','aftermarket','taken','unknown']

const PRICE_MAX = 200

function nameLengthBucket(domain) {
  const len = domain.split('.')[0].length
  return len <= 5 ? 'short' : len <= 10 ? 'medium' : 'long'
}

function advActiveCount(advFilters, advPriceRange, advTldCats, advMinSeo, advNameLength) {
  let n = 0
  if (advFilters.size !== ADV_STATUSES.length) n++
  if (advPriceRange[0] > 0 || advPriceRange[1] < PRICE_MAX) n++
  if (advTldCats.size > 0) n++
  if (advMinSeo > 0) n++
  if (advNameLength.size < 3) n++
  return n
}

export function ResultsView({ keyword, primaryDomain, results, livePrices, healthData = {}, loading, wave3Available, onLoadWave3, onLiveCheck, onLoadHealth, saved = [], onSave, ideasKw }) {
  const [mainTab,      setMainTab]      = useState('search')
  const [quickFilter,  setQuickFilter]  = useState('all-tlds')
  const [sortId,       setSortId]       = useState('seo-desc')
  const [sortOpen,     setSortOpen]     = useState(false)
  const [advFilters,    setAdvFilters]    = useState(new Set(ADV_STATUSES))
  const [advPriceRange, setAdvPriceRange] = useState([0, 200])
  const [advTldCats,    setAdvTldCats]    = useState(new Set())
  const [advMinSeo,     setAdvMinSeo]     = useState(0)
  const [advNameLength, setAdvNameLength] = useState(new Set(['short','medium','long']))
  const [advDrawerOpen, setAdvDrawerOpen] = useState(false)
  const [detailDomain,    setDetailDomain]    = useState(null)
  const [unlockedDomains, setUnlockedDomains] = useState(new Set())
  const [visibleCount, setVisibleCount] = useState(30)

  const handleLiveCheck = useCallback((domain) => {
    setUnlockedDomains(prev => new Set([...prev, domain]))
    onLiveCheck?.(domain)
  }, [onLiveCheck])

  // Reset pagination whenever filter or sort changes
  useEffect(() => { setVisibleCount(30) }, [quickFilter, sortId])
  // Also reset when new search fires
  useEffect(() => {
    setVisibleCount(30)
    setMainTab('search')
    setAdvPriceRange([0, 200]); setAdvTldCats(new Set()); setAdvMinSeo(0)
    setAdvNameLength(new Set(['short','medium','long']))
  }, [keyword])

  // Switch to Other Ideas tab when a wand-modal keyword comes in
  useEffect(() => {
    if (ideasKw) setMainTab('other-ideas')
  }, [ideasKw])

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
      // case 'bot-desc':   return sorted.sort((a, b) => botScore(b.domain, livePrices) - botScore(a.domain, livePrices))
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
      case 'popular':  items = [...items].sort((a, b) => seoScore(b.domain) - seoScore(a.domain)).slice(0, 18); break
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
  const advItems = useMemo(() => {
    const tld = d => d.domain.split('.').slice(1).join('.')
    const kw  = d => d.domain.split('.')[0]
    let items = allEntries.filter(e => {
      if (!advFilters.has(e.status)) return false
      if (advNameLength.size < 3 && !advNameLength.has(nameLengthBucket(e.domain))) return false
      const price = getLowestPrice(e.domain, livePrices)
      if (price < 9999 && (price < advPriceRange[0] || price > advPriceRange[1])) return false
      if (advMinSeo > 0 && seoScore(e.domain) < advMinSeo) return false
      if (advTldCats.size > 0) {
        const ext = tld(e); const kwLen = kw(e).length
        const match = [...advTldCats].some(c => {
          if (c === 'popular')  return ['com','net','org','io','ai','co','app','dev'].includes(ext)
          if (c === 'business') return BUSINESS_TLDS.includes(ext)
          if (c === 'tech')     return TECH_TLDS.includes(ext)
          if (c === 'startup')  return STARTUP_TLDS.includes(ext) || kwLen <= 7
          if (c === 'creative') return CREATIVE_TLDS.includes(ext)
          if (c === 'short')    return kwLen <= 6
          if (c === 'cheap')    return price <= 5
          return false
        })
        if (!match) return false
      }
      return true
    })
    return applySort(items)
  }, [allEntries, advFilters, advPriceRange, advTldCats, advMinSeo, advNameLength, sortId, livePrices])

  function toggleAdvFilter(status) {
    setAdvFilters(prev => {
      const next = new Set(prev)
      if (next.has(status)) next.delete(status)
      else next.add(status)
      return next
    })
  }

  function toggleAdvTldCat(id) {
    setAdvTldCats(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })
  }

  function toggleAdvNameLength(b) {
    setAdvNameLength(prev => { const s = new Set(prev); s.has(b) ? s.delete(b) : s.add(b); return s })
  }

  function clearAdvFilters() {
    setAdvFilters(new Set(ADV_STATUSES)); setAdvPriceRange([0, PRICE_MAX])
    setAdvTldCats(new Set()); setAdvMinSeo(0); setAdvNameLength(new Set(['short','medium','long']))
  }

  const checkingCount  = allEntries.filter(e => e.status === 'checking').length
  const availableCount = availableEntries.length
  const advCount       = advItems.length
  const currentSort    = SORT_OPTIONS.find(s => s.id === sortId)

  if (!keyword) return null

  return (
    <div className="results-view">
      {/* Main tab bar */}
      <div className="main-tab-bar">
        <div className="main-tabs">
          <button
            className={`main-tab ${mainTab === 'search' ? 'active' : ''}`}
            onClick={() => setMainTab('search')}
          >
            Available <span className="tab-count">{availableCount}</span>
          </button>
          <button
            className={`main-tab ${mainTab === 'domains' ? 'active' : ''}`}
            onClick={() => setMainTab('domains')}
          >
            All Domains
          </button>
          <button
            className={`main-tab ${mainTab === 'other-ideas' ? 'active' : ''}`}
            onClick={() => setMainTab('other-ideas')}
          >
            Other Ideas
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

        {/* Status legend — only on tabs where multiple statuses appear */}
        {(mainTab === 'advanced' || mainTab === 'domains') && (
          <div className="tab-bar-legend">
            <span className="tbl-item available">Available</span>
            <span className="tbl-item premium">Premium</span>
            <span className="tbl-item aftermarket">Aftermarket</span>
            <span className="tbl-item taken">Taken</span>
          </div>
        )}

        {/* Sort dropdown */}
        <div className="sort-wrap">
          <button className="sort-btn" onClick={() => setSortOpen(o => !o)} disabled={mainTab === 'domains'}>
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

      {/* Domains panel */}
      {mainTab === 'domains' && (
        <DomainsView keyword={keyword} results={results} onDetail={setDetailDomain} />
      )}

      {/* Other Ideas panel */}
      {mainTab === 'other-ideas' && (
        <OtherIdeasView keyword={ideasKw || keyword} onDetail={setDetailDomain} saved={saved} onSave={toggleSave} />
      )}

      {/* Search panel */}
      {mainTab === 'search' && (
        <div className="basic-panel">
          <div className="basic-header">
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
            {basicItems.length > 0 && (
              <CopyAllButton
                visibleDomains={basicItems.slice(0, visibleCount).map(e => e.domain)}
                allDomains={basicItems.map(e => e.domain)}
              />
            )}
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
                      healthData={healthData}
                      saved={saved.includes(e.domain)}
                      isUnlocked={unlockedDomains.has(e.domain)}
                      onSave={toggleSave}
                      onDetail={setDetailDomain}
                      onLiveCheck={handleLiveCheck}
                      onLoadHealth={onLoadHealth}
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
      {mainTab === 'advanced' && (() => {
        const activeCount = advActiveCount(advFilters, advPriceRange, advTldCats, advMinSeo, advNameLength)
        const sidebarProps = {
          advFilters, toggleAdvFilter,
          advPriceRange, setAdvPriceRange,
          advTldCats, toggleAdvTldCat,
          advMinSeo, setAdvMinSeo,
          advNameLength, toggleAdvNameLength,
          activeCount, onClear: clearAdvFilters,
        }
        return (
          <div className="advanced-panel">
            {/* Mobile top bar */}
            <div className="adv-mobile-bar">
              <button className="adv-filter-trigger" onClick={() => setAdvDrawerOpen(true)}>
                <FilterIcon />
                Filters
                {activeCount > 0 && <span className="adv-trigger-badge">{activeCount}</span>}
              </button>
              <span className="adv-result-count">{advItems.length} results</span>
            </div>

            <div className="adv-layout">
              <aside className="adv-sidebar">
                <AdvSidebarContent {...sidebarProps} />
              </aside>
              <div className="adv-results">
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
                      healthData={healthData}
                      saved={saved.includes(e.domain)}
                      onSave={toggleSave}
                      onLiveCheck={handleLiveCheck}
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
            </div>

            {/* Mobile drawer */}
            {advDrawerOpen && (
              <>
                <div className="adv-drawer-backdrop" onClick={() => setAdvDrawerOpen(false)} />
                <div className="adv-drawer">
                  <div className="adv-drawer-handle" />
                  <div className="adv-drawer-header">
                    <span className="adv-drawer-title">Filters</span>
                    <button className="adv-drawer-close" onClick={() => setAdvDrawerOpen(false)}>Done</button>
                  </div>
                  <div className="adv-drawer-body">
                    <AdvSidebarContent {...sidebarProps} />
                  </div>
                </div>
              </>
            )}
          </div>
        )
      })()}

      <p className="dns-note">
        <InfoIcon /> Availability via DNS lookup · Click <strong>Live check</strong> on any domain for authoritative data + real pricing.
      </p>

      {detailDomain && (() => {
        const detailList = (mainTab === 'advanced' ? advItems : basicItems).map(e => e.domain)
        const detailIdx  = detailList.indexOf(detailDomain)
        return (
          <DomainModal
            domain={detailDomain}
            result={results[detailDomain]}
            livePrices={livePrices}
            healthData={healthData}
            onLoadHealth={onLoadHealth}
            saved={saved.includes(detailDomain)}
            isUnlocked={unlockedDomains.has(detailDomain)}
            onSave={toggleSave}
            onLiveCheck={handleLiveCheck}
            onClose={() => setDetailDomain(null)}
            onPrev={detailIdx > 0 ? () => setDetailDomain(detailList[detailIdx - 1]) : null}
            onNext={detailIdx < detailList.length - 1 ? () => setDetailDomain(detailList[detailIdx + 1]) : null}
            position={`${detailIdx + 1} / ${detailList.length}`}
          />
        )
      })()}
    </div>
  )
}

/* ── Copy All Button ── */
function CopyAllButton({ visibleDomains, allDomains }) {
  const [copied, setCopied] = useState(null)
  const [open,   setOpen]   = useState(false)

  const copy = useCallback((domains, type) => {
    navigator.clipboard.writeText(domains.join(', ')).then(() => {
      setCopied(type)
      setOpen(false)
      setTimeout(() => setCopied(null), 2000)
    })
  }, [])

  return (
    <div className="copy-all-wrap">
      <button className="copy-all-btn" onClick={() => setOpen(o => !o)}>
        {copied ? <CheckIconSm /> : <CopyIconSm />}
        {copied ? 'Copied!' : 'Copy'}
        <ChevronIcon />
      </button>
      {open && (
        <div className="copy-all-dropdown">
          <button className="copy-all-opt" onClick={() => copy(visibleDomains, 'visible')}>
            <CopyIconSm /> Copy all on screen <span className="copy-all-count">{visibleDomains.length}</span>
          </button>
          <button className="copy-all-opt" onClick={() => copy(allDomains, 'all')}>
            <CopyIconSm /> Copy all results <span className="copy-all-count">{allDomains.length}</span>
          </button>
        </div>
      )}
    </div>
  )
}

function CopyIconSm()  { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> }
function CheckIconSm() { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg> }

/* ── Icons ── */
function GlobeIcon()     { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg> }
function StarIcon()      { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg> }
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
function FilterIcon()    { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg> }

/* ── Advanced Sidebar ── */
const STATUS_OPTS = [
  { id: 'available',   label: 'Available',   color: 'var(--green)' },
  { id: 'premium',     label: 'Premium',     color: 'var(--yellow)' },
  { id: 'aftermarket', label: 'Aftermarket', color: 'var(--blue)' },
  { id: 'taken',       label: 'Taken',       color: 'var(--red)' },
  { id: 'unknown',     label: 'Unknown',     color: 'var(--text-muted)' },
]

const TLD_CATS = [
  { id: 'popular',  label: 'Popular' },
  { id: 'business', label: 'Business' },
  { id: 'tech',     label: 'Tech' },
  { id: 'startup',  label: 'Startup' },
  { id: 'creative', label: 'Creative' },
  { id: 'short',    label: 'Short ≤6' },
  { id: 'cheap',    label: 'Cheap <$5' },
]

function AdvSidebarContent({ advFilters, toggleAdvFilter, advPriceRange, setAdvPriceRange, advTldCats, toggleAdvTldCat, advMinSeo, setAdvMinSeo, advNameLength, toggleAdvNameLength, activeCount, onClear }) {
  const priceLabel = advPriceRange[0] === 0 && advPriceRange[1] >= PRICE_MAX
    ? 'Any'
    : `$${advPriceRange[0]}–${advPriceRange[1] >= PRICE_MAX ? '$200+' : '$' + advPriceRange[1]}`

  return (
    <div className="adv-sidebar-inner">
      <div className="adv-section">
        {activeCount > 0
          ? <button className="adv-clear-btn" onClick={onClear}>Clear all filters</button>
          : <span className="adv-sidebar-title">Filters</span>
        }
      </div>

      {/* Status */}
      <div className="adv-section">
        <div className="adv-section-label">Status</div>
        {STATUS_OPTS.map(s => (
          <label key={s.id} className="adv-checkbox-row" onClick={() => toggleAdvFilter(s.id)}>
            <span className={`adv-checkbox ${advFilters.has(s.id) ? 'checked' : ''}`} />
            <span className="adv-dot-sm" style={{ background: s.color }} />
            <span className="adv-checkbox-label">{s.label}</span>
          </label>
        ))}
      </div>
      <div className="adv-section-divider" />

      {/* Price */}
      <div className="adv-section">
        <div className="adv-section-label">Price / yr</div>
        <div className="adv-range-display">{priceLabel}</div>
        <div className="adv-slider-row">
          <span className="adv-slider-bound">$0</span>
          <div style={{ flex: 1, position: 'relative', height: 20, display: 'flex', alignItems: 'center' }}>
            <input
              type="range" min={0} max={PRICE_MAX} step={5}
              value={advPriceRange[0]}
              className="adv-slider"
              style={{ position: 'absolute', width: '100%' }}
              onChange={e => {
                const v = Number(e.target.value)
                setAdvPriceRange([Math.min(v, advPriceRange[1] - 5), advPriceRange[1]])
              }}
            />
            <input
              type="range" min={0} max={PRICE_MAX} step={5}
              value={advPriceRange[1]}
              className="adv-slider adv-slider-full"
              onChange={e => {
                const v = Number(e.target.value)
                setAdvPriceRange([advPriceRange[0], Math.max(v, advPriceRange[0] + 5)])
              }}
            />
          </div>
          <span className="adv-slider-bound">$200+</span>
        </div>
      </div>
      <div className="adv-section-divider" />

      {/* TLD Category */}
      <div className="adv-section">
        <div className="adv-section-label">TLD Category</div>
        <div className="adv-chip-group">
          {TLD_CATS.map(c => (
            <button
              key={c.id}
              className={`adv-chip ${advTldCats.has(c.id) ? 'active' : ''}`}
              onClick={() => toggleAdvTldCat(c.id)}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>
      <div className="adv-section-divider" />

      {/* SEO Score */}
      <div className="adv-section">
        <div className="adv-section-label">Min SEO Score</div>
        <div className="adv-range-display">{advMinSeo === 0 ? 'Any' : advMinSeo}</div>
        <div className="adv-slider-row">
          <span className="adv-slider-bound">0</span>
          <input
            type="range" min={0} max={90} step={5}
            value={advMinSeo}
            className="adv-slider"
            style={{ flex: 1 }}
            onChange={e => setAdvMinSeo(Number(e.target.value))}
          />
          <span className="adv-slider-bound">90</span>
        </div>
      </div>
      <div className="adv-section-divider" />

      {/* Name Length */}
      <div className="adv-section">
        <div className="adv-section-label">Name Length</div>
        {[
          { id: 'short',  label: 'Short',  sub: '≤5 chars' },
          { id: 'medium', label: 'Medium', sub: '6–10 chars' },
          { id: 'long',   label: 'Long',   sub: '11+ chars' },
        ].map(b => (
          <label key={b.id} className="adv-checkbox-row" onClick={() => toggleAdvNameLength(b.id)}>
            <span className={`adv-checkbox ${advNameLength.has(b.id) ? 'checked' : ''}`} />
            <span className="adv-checkbox-label">
              {b.label} <span className="adv-checkbox-sub">{b.sub}</span>
            </span>
          </label>
        ))}
      </div>
    </div>
  )
}
