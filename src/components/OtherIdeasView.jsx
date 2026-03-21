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
  available:   '#16a34a',
  premium:     '#b45309',
  aftermarket: '#1d4ed8',
  taken:       '#dc2626',
  checking:    '#374151',
  unknown:     '#6b7280',
}

export function OtherIdeasView({ keyword }) {
  const [results,  setResults]  = useState({})
  const [loading,  setLoading]  = useState(false)
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

  const entries = Object.entries(results)
  if (entries.length === 0) return null

  // Split into 3 columns, filling column-first
  const cols = [[], [], []]
  entries.forEach(([domain, r], i) => {
    cols[i % 3].push({ domain, ...r })
  })

  return (
    <div className="ideas-view">
      <div className="ideas-header">
        <span className="ideas-title">Name ideas for <strong>{keyword}.com</strong></span>
        {loading && (
          <span className="ideas-checking">
            <span className="dns-spinner" style={{ width: 10, height: 10, borderWidth: 2 }} />
            Checking…
          </span>
        )}
      </div>

      <div className="ideas-grid">
        {cols.map((col, ci) => (
          <div key={ci} className="ideas-col">
            {col.map(({ domain, status, price }) => {
              const isAvailable = status === 'available' || status === 'premium'
              const isTaken     = status === 'taken' || status === 'aftermarket'

              return (
                <div key={domain} className="ideas-row">
                  <span
                    className="ideas-dot"
                    style={{ background: STATUS_DOT[status] ?? STATUS_DOT.unknown }}
                  />
                  <span className="ideas-domain">{domain}</span>
                  <a
                    className={`ideas-action ${status}`}
                    href={
                      isAvailable
                        ? `https://www.godaddy.com/domainsearch/find?domainToCheck=${domain}`
                        : isTaken
                        ? `https://lookup.icann.org/en/lookup?name=${domain}`
                        : undefined
                    }
                    target={isAvailable || isTaken ? '_blank' : undefined}
                    rel="noreferrer"
                  >
                    {status === 'checking' ? '…' :
                     status === 'available' ? (price ? `$${price.toFixed(0)}/yr` : 'Register →') :
                     status === 'premium'   ? `$${price?.toFixed(0) ?? '?'}` :
                     status === 'taken'     ? 'Taken' :
                     status === 'aftermarket' ? 'Aftermarket' :
                     'Unknown'}
                  </a>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
