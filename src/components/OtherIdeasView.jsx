/**
 * src/components/OtherIdeasView.jsx
 * Algorithmically generated domain name variations for the keyword.
 * Each refresh picks a different random subset from the full pools.
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { fetchBatch } from '../lib/availability'

const PREFIXES_POOL = [
  'get', 'my', 'the', 'go', 'try', 'use', 'hey', 'join', 'we', 'meet',
  're', 'in', 'new', 'pro', 'web', 'find', 'love', 'be', 'on', 'its',
  'hi', 'hello', 'with', 'for', 'run', 'make', 'build', 'open', 'just',
  'simple', 'smart', 'super', 'quick', 'fast', 'real', 'true', 'good',
  'best', 'top', 'one', 'all', 'our', 'your', 'i', 'do', 'lets', 'ask',
]

const SUFFIXES_POOL = [
  'team', 'tech', 'app', 'labs', 'studio', 'cloud', 'hub', 'hq', 'site',
  'shop', 'group', 'design', 'online', 'works', 'now', 'plus', 'up',
  'central', 'spot', 'base', 'zone', 'world', 'co', 'ly', 'ing',
  'ai', 'io', 'ify', 'er', 'ful', 'ness', 'ware', 'desk', 'flow',
  'stack', 'box', 'kit', 'pad', 'space', 'place', 'point', 'link',
  'net', 'api', 'platform', 'suite', 'dash', 'pulse', 'core', 'mark',
]

// Seeded shuffle so each refreshKey gives different but reproducible results
function seededShuffle(arr, seed) {
  const a = [...arr]
  let s = seed
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    const j = Math.abs(s) % (i + 1);
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function generateDomains(kw, seed) {
  // Use full pools shuffled — gives ~100 candidates to find 24 available
  const prefixes = seededShuffle(PREFIXES_POOL, seed)
  const suffixes = seededShuffle(SUFFIXES_POOL, seed + 1)
  const seen = new Set()
  const domains = []
  const add = d => { if (!seen.has(d)) { seen.add(d); domains.push(d) } }
  const maxLen = Math.max(prefixes.length, suffixes.length)
  for (let i = 0; i < maxLen; i++) {
    if (i < prefixes.length) add(`${prefixes[i]}${kw}.com`)
    if (i < suffixes.length) add(`${kw}${suffixes[i]}.com`)
  }
  return domains
}

const TARGET = 24

const STATUS_DOT = {
  available:   'var(--green)',
  premium:     'var(--yellow)',
  aftermarket: 'var(--blue)',
  taken:       'var(--red)',
  checking:    'var(--border-hover)',
  unknown:     'var(--text-dim)',
}

export function OtherIdeasView({ keyword }) {
  const [results,    setResults]    = useState({})
  const [loading,    setLoading]    = useState(true)
  const [refreshKey, setRefreshKey] = useState(1)
  const currentKw  = useRef('')
  const currentKey = useRef(1)

  const run = useCallback(async (kw, key) => {
    currentKw.current  = kw
    currentKey.current = key
    const domains = generateDomains(kw, key * 999983)
    setResults({})
    setLoading(true)

    // Enforce a minimum 800ms so ghost rows never flash and disappear
    const [fresh] = await Promise.all([
      fetchBatch(domains).catch(() => ({})),
      new Promise(r => setTimeout(r, 800)),
    ])

    if (currentKw.current !== kw || currentKey.current !== key) return
    setResults(fresh)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!keyword) return
    run(keyword, refreshKey)
  }, [keyword, refreshKey, run])

  function handleRefresh() {
    setRefreshKey(k => k + 1)
  }

  if (!keyword) return null

  const available = Object.entries(results)
    .filter(([, r]) => r.status === 'available' || r.status === 'premium')
    .map(([domain, r]) => ({ domain, ...r }))
    .slice(0, TARGET)

  const cols = [[], [], []]
  available.forEach((item, i) => { cols[i % 3].push(item) })

  return (
    <div className="ideas-view">
      <div className="ideas-header">
        <span className="ideas-title">
          Available name ideas for <strong>{keyword}</strong>
          {!loading && available.length > 0 && (
            <span className="ideas-count">{available.length}</span>
          )}
        </span>
        <div className="ideas-header-actions">
          {loading && (
            <span className="ideas-checking">
              <span className="dns-spinner" style={{ width: 10, height: 10, borderWidth: 2 }} />
              Checking…
            </span>
          )}
          <button
            className="ideas-refresh-btn"
            onClick={handleRefresh}
            disabled={loading}
            title="Generate new ideas"
          >
            <RefreshIcon spinning={loading} />
            New ideas
          </button>
        </div>
      </div>

      {/* Ghost rows while loading */}
      {loading && (
        <div className="ideas-grid">
          {[0, 1, 2].map(ci => (
            <div key={ci} className="ideas-col">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="ideas-row ideas-ghost-row">
                  <span className="ideas-ghost-dot" />
                  <span className="ideas-ghost-text" style={{ width: `${55 + ((ci * 7 + i * 13) % 30)}%` }} />
                  <span className="ideas-ghost-btn" />
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {!loading && available.length === 0 && (
        <div className="tab-empty">Couldn't find 24 available ideas — try refreshing for a different set.</div>
      )}

      {!loading && available.length > 0 && (
        <div className="ideas-grid ideas-grid-loaded">
          {cols.map((col, ci) => (
            <div key={ci} className="ideas-col">
              {col.map(({ domain, status, price }, i) => (
                <div key={domain} className="ideas-row" style={{ animationDelay: `${i * 30}ms` }}>
                  <span
                    className="ideas-dot"
                    style={{ background: STATUS_DOT[status] ?? STATUS_DOT.unknown }}
                  />
                  <span className="ideas-domain">{domain}</span>
                  <a
                    className={`ideas-action ${status}`}
                    href={`https://www.godaddy.com/domainsearch/find?domainToCheck=${domain}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {status === 'premium' && price ? `$${price.toFixed(0)}` : 'Register →'}
                  </a>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function RefreshIcon({ spinning }) {
  return (
    <svg
      width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
      style={spinning ? { animation: 'spin 0.8s linear infinite' } : undefined}
    >
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
      <path d="M21 3v5h-5"/>
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
      <path d="M8 16H3v5"/>
    </svg>
  )
}
