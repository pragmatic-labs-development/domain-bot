/**
 * src/lib/api.js
 *
 * Thin wrapper around the Worker (or local mock via Vite proxy).
 * All components import from here — swap the base URL for production.
 */

// In dev, Vite proxies /api/* → localhost:3001
// In production, set VITE_WORKER_URL to your Cloudflare Worker URL
const BASE = import.meta.env.VITE_WORKER_URL
  ? import.meta.env.VITE_WORKER_URL
  : '/api'

/**
 * Check availability for a list of domain strings.
 * @param {string[]} domains  e.g. ['example.com', 'example.io']
 * @returns {Promise<DomainResult[]>}
 */
export async function checkDomains(domains) {
  const url = `${BASE}/check?domains=${encodeURIComponent(domains.join(','))}`
  const res = await fetch(url)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `HTTP ${res.status}`)
  }
  const { results } = await res.json()
  return results
}

/**
 * Suggest domains for a keyword across a set of TLDs.
 * @param {string}   query  e.g. 'myapp'
 * @param {string[]} tlds   e.g. ['com', 'io', 'ai']
 * @returns {Promise<DomainResult[]>}
 */
export async function suggestDomains(query, tlds) {
  const url = `${BASE}/suggest?query=${encodeURIComponent(query)}&tlds=${tlds.join(',')}`
  const res = await fetch(url)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `HTTP ${res.status}`)
  }
  const { results } = await res.json()
  return results
}

/**
 * Format a price from micro-units (GoDaddy uses 1,000,000 = $1.00).
 * @param {number|null} microPrice
 * @param {string}      currency
 */
export function formatPrice(microPrice, currency = 'USD') {
  if (microPrice == null) return null
  const dollars = microPrice / 1_000_000
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(dollars)
}

/**
 * Fetch the Domain Health Snapshot for a single domain.
 * @param {string} domain  e.g. 'example.com'
 * @returns {Promise<DomainHealth>}
 */
export async function checkHealth(domain) {
  const url = `${BASE}/health?domain=${encodeURIComponent(domain)}`
  const res = await fetch(url)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `HTTP ${res.status}`)
  }
  return res.json()
}

/**
 * @typedef {Object} DomainResult
 * @property {string}       domain
 * @property {boolean}      available
 * @property {number|null}  price       micro-units
 * @property {string}       currency
 * @property {boolean}      definitive
 */
