/**
 * src/components/OtherIdeasView.jsx
 * Algorithmically generated domain name variations for the keyword,
 * all checked against .com availability. No AI required.
 */

import { useState, useEffect, useRef } from 'react'
import { fetchBatch } from '../lib/availability'

const PREFIXES = [
  'get', 'my', 'the', 'go', 'try', 'use', 'hey', 'join', 'we', 'meet',
  're', 'in', 'new', 'pro', 'web', 'find', 'love', 'be', 'on', 'its',
]

const SUFFIXES = [
  'team', 'tech', 'app', 'labs', 'studio', 'cloud', 'hub', 'hq', 'site',
  'shop', 'group', 'design', 'online', 'works', 'now', 'plus', 'up',
  'central', 'spot', 'base', 'zone', 'world', 'co', 'ly', 'ing',
]

function generateDomains(kw) {
  const seen = new Set()
  const domains = []
  const add = d => { if (!seen.has(d)) { seen.add(d); domains.push(d) } }

  // Interleave prefix and suffix variants so the list feels varied
  const maxLen = Math.max(PREFIXES.length, SUFFIXES.length)
  for (let i = 0; i < maxLen; i++) {
    if (i < PREFIXES.length) add(`${PREFIXES[i]}${kw}.com`)
    if (i < SUFFIXES.length) add(`${kw}${SUFFIXES[i]}.com`)
  }
  return domains
}

const STATUS_DOT = {
  available:   'var(--green)',
  premium:     'var(--yellow)',
  aftermarket: 'var(--blue)',
  taken:       'var(--red)',
  checking:    'var(--border-hover)',
  unknown:     'var(--text-dim)',
}

export function OtherIdeasView({ keyword }) {
  const [results,  setResults]  = useState({})
  const [loading,  setLoading]  = useState(true)
  const currentKw = useRef('')

  useEffect(() => {
    if (!keyword) return
    currentKw.current = keyword

    const domains = generateDomains(keyword)
    const initial = Object.fromEntries(domains.map(d => [d, { status: 'checking' }]))
    setResults(initial)
    setLoading(true)

    fetchBatch(domains).then(fresh => {
      if (currentKw.current !== keyword) return
      setResults(fresh)
      setLoading(false)
    })
  }, [keyword])

  if (!keyword) return null

  // Only show available/premium domains — filter out taken/unknown
  const available = Object.entries(results)
    .filter(([, r]) => r.status === 'available' || r.status === 'premium')
    .map(([domain, r]) => ({ domain, ...r }))

  // Split into 3 columns, filling column-first
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
        {loading && (
          <span className="ideas-checking">
            <span className="dns-spinner" style={{ width: 10, height: 10, borderWidth: 2 }} />
            Checking…
          </span>
        )}
      </div>

      {!loading && available.length === 0 && (
        <div className="tab-empty">No available name ideas found. Try a different keyword.</div>
      )}

      {available.length > 0 && (
        <div className="ideas-grid">
          {cols.map((col, ci) => (
            <div key={ci} className="ideas-col">
              {col.map(({ domain, status, price }) => (
                <div key={domain} className="ideas-row">
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
