/**
 * src/hooks/useSearch.js
 *
 * Wave-based streaming domain search.
 * Triggered explicitly via triggerSearch() — not on every keystroke.
 *
 * Wave 1 (~50 TLDs): fires immediately
 * Wave 2 (~100 TLDs): fires after 400ms
 * Wave 3 (~100 TLDs): fires on demand via loadWave3()
 */

import { useState, useRef, useCallback } from 'react'
import { TLDS_W1, TLDS_W2, TLDS_W3, AFTERMARKET_WORDS } from '../lib/tlds'
import { fetchBatch, liveCheck } from '../lib/availability'
import { checkHealth } from '../lib/api'

// Session-level cache — persists across searches, avoids re-checking known domains
const sessionCache = {}
// Health cache — keyed by domain, same lifetime as session
const healthCache = {}

function generateAftermarket(kw) {
  return AFTERMARKET_WORDS
    .map(w => ({ name: `${kw}${w}.com`, status: 'aftermarket' }))
    .concat(AFTERMARKET_WORDS.slice(0, 5).map(w => ({ name: `${w}${kw}.com`, status: 'aftermarket' })))
    .slice(0, 12)
}

export function useSearch() {
  const [keyword, setKeyword]             = useState('')
  const [primaryDomain, setPrimaryDomain] = useState('')
  const [results, setResults]             = useState({}) // { [domain]: { status, price, tier } }
  const [loading, setLoading]             = useState(false)
  const [wave3Available, setWave3Available] = useState(false)
  const [livePrices, setLivePrices]       = useState({}) // { [domain]: priceUSD } from GoDaddy
  const [healthData, setHealthData]       = useState({}) // { [domain]: DomainHealth }

  const currentKw = useRef('')

  const mergeResults = useCallback((updates) => {
    setResults(prev => ({ ...prev, ...updates }))
    // Also track any live prices returned by the Worker
    const prices = {}
    Object.entries(updates).forEach(([domain, r]) => {
      if (r.price != null) prices[domain] = r.price
    })
    if (Object.keys(prices).length > 0) {
      setLivePrices(prev => ({ ...prev, ...prices }))
    }
  }, [])

  const triggerSearch = useCallback(async (rawQuery) => {
    const kw = rawQuery.trim().toLowerCase()
    const stripped = kw.split('.')[0].replace(/[^a-z0-9-]/g, '')
    if (!stripped) return

    const typedExt = kw.includes('.') ? kw.split('.').slice(1).join('.') : 'com'
    const primary  = `${stripped}.${typedExt}`

    currentKw.current = stripped
    setKeyword(stripped)
    setPrimaryDomain(primary)
    setWave3Available(false)
    setLivePrices({})

    // Build initial state: all W1+W2 domains as 'checking', aftermarket pre-populated
    const aftermarket = generateAftermarket(stripped)
    const initial = {}
    TLDS_W1.forEach(t => { initial[`${stripped}.${t.ext}`] = { status: 'checking' } })
    TLDS_W2.forEach(t => { initial[`${stripped}.${t.ext}`] = { status: 'checking' } })
    aftermarket.forEach(d => { initial[d.name] = { status: 'aftermarket' } })
    setResults(initial)
    setLoading(true)

    // ── Wave 1: fire immediately ─────────────────────────────────────────────
    const w1Names = TLDS_W1.map(t => `${stripped}.${t.ext}`)
    const w1Uncached = w1Names.filter(d => !sessionCache[d])
    const w1Cached   = Object.fromEntries(w1Names.filter(d => sessionCache[d]).map(d => [d, sessionCache[d]]))

    const w1Fresh = w1Uncached.length > 0 ? await fetchBatch(w1Uncached) : {}
    Object.assign(sessionCache, w1Fresh)

    if (currentKw.current !== stripped) return
    mergeResults({ ...w1Cached, ...w1Fresh })

    // ── Wave 2: fire after 400ms ─────────────────────────────────────────────
    await new Promise(r => setTimeout(r, 400))
    if (currentKw.current !== stripped) return

    const w2Names = TLDS_W2.map(t => `${stripped}.${t.ext}`)
    const w2Uncached = w2Names.filter(d => !sessionCache[d])
    const w2Cached   = Object.fromEntries(w2Names.filter(d => sessionCache[d]).map(d => [d, sessionCache[d]]))

    const w2Fresh = w2Uncached.length > 0 ? await fetchBatch(w2Uncached) : {}
    Object.assign(sessionCache, w2Fresh)

    if (currentKw.current !== stripped) return
    mergeResults({ ...w2Cached, ...w2Fresh })
    setLoading(false)
    setWave3Available(true)
  }, [mergeResults])

  // ── Wave 3: on demand ──────────────────────────────────────────────────────
  const loadWave3 = useCallback(async () => {
    const stripped = currentKw.current
    if (!stripped) return

    setWave3Available(false)
    setLoading(true)

    const w3Names = TLDS_W3.map(t => `${stripped}.${t.ext}`)
    // Mark all as checking first
    const checking = Object.fromEntries(w3Names.map(d => [d, { status: 'checking' }]))
    setResults(prev => ({ ...prev, ...checking }))

    const w3Uncached = w3Names.filter(d => !sessionCache[d])
    const w3Cached   = Object.fromEntries(w3Names.filter(d => sessionCache[d]).map(d => [d, sessionCache[d]]))

    const w3Fresh = w3Uncached.length > 0 ? await fetchBatch(w3Uncached) : {}
    Object.assign(sessionCache, w3Fresh)

    if (currentKw.current !== stripped) return
    mergeResults({ ...w3Cached, ...w3Fresh })
    setLoading(false)
  }, [mergeResults])

  // ── Per-domain health snapshot ─────────────────────────────────────────────
  const loadHealth = useCallback(async (domain) => {
    if (healthCache[domain]) {
      setHealthData(prev => ({ ...prev, [domain]: healthCache[domain] }))
      return
    }
    try {
      const data = await checkHealth(domain)
      healthCache[domain] = data
      setHealthData(prev => ({ ...prev, [domain]: data }))
    } catch (e) {
      console.warn('[DomainBot] Health check failed for', domain, e.message)
    }
  }, [])

  // ── Per-domain live check (GoDaddy authoritative) ──────────────────────────
  const checkLive = useCallback(async (domain) => {
    // Don't set status:'checking' — that removes available cards from the tab.
    // The card's lock button already shows a loading animation.
    // Fire health check in parallel — don't await
    loadHealth(domain)
    try {
      const result = await liveCheck(domain)
      sessionCache[domain] = result
      mergeResults({ [domain]: result })
    } catch (e) {
      console.warn('[DomainBot] Live check failed for', domain, e.message)
    }
  }, [mergeResults, loadHealth])

  return {
    keyword,
    primaryDomain,
    results,
    livePrices,
    healthData,
    loading,
    wave3Available,
    triggerSearch,
    loadWave3,
    checkLive,
    loadHealth,
  }
}
