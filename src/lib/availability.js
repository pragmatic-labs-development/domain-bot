/**
 * src/lib/availability.js
 * Three-tier availability checking — ported from domain-bot.com
 *
 * Tier 1: GoDaddy via Cloudflare Worker (authoritative + prices)
 * Tier 2: DNS-over-HTTPS (Cloudflare DoH) — private, no API key
 * Tier 3: Static fallback — marks as unknown
 */

const WORKER_URL =
  import.meta.env.VITE_WORKER_URL ||
  'https://domain-bot-proxy.dave-pragmatic-labs.workers.dev'

// Track Worker health for the session — avoid retrying a known-down endpoint
let godaddyReachable = null // null = untested, true = ok, false = down

/**
 * Fetch availability for a batch of domains.
 * Returns { [domain]: { status, price, tier } }
 *
 * Already-cached domains are filtered by the caller (useSearch hook).
 */
export async function fetchBatch(domains) {
  if (domains.length === 0) return {}

  // ── Tier 1: GoDaddy via Worker ──────────────────────────────────────────
  if (godaddyReachable !== false) {
    try {
      const res = await fetch(
        `${WORKER_URL}/check?domains=${encodeURIComponent(domains.join(','))}`,
        { signal: AbortSignal.timeout(6000) }
      )
      if (!res.ok) throw new Error(`Worker ${res.status}`)
      const data = await res.json()
      if (!data.results?.length) throw new Error('Empty results')

      godaddyReachable = true
      const batch = {}
      data.results.forEach(r => {
        batch[r.domain] = {
          status: r.available ? 'available' : 'taken',
          price:  r.price != null ? r.price / 1_000_000 : null,
          tier:   'godaddy',
        }
      })
      console.info('[DomainBot] Tier 1: GoDaddy ✓', domains.length, 'domains')
      return batch
    } catch (e) {
      godaddyReachable = false
      console.warn('[DomainBot] Tier 1: GoDaddy unavailable, falling back to DNS:', e.message)
    }
  }

  // ── Tier 2: DNS-over-HTTPS (parallel) ───────────────────────────────────
  const batch = {}
  await Promise.allSettled(
    domains.map(async domain => {
      try {
        const res = await fetch(
          `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=A`,
          { headers: { Accept: 'application/dns-json' }, signal: AbortSignal.timeout(4000) }
        )
        if (!res.ok) throw new Error(`DoH ${res.status}`)
        const data = await res.json()
        // Status 3 = NXDOMAIN → domain doesn't exist → available
        // Status 0 = NOERROR with answers → domain has DNS → taken
        batch[domain] = {
          status: data.Status === 3 ? 'available' : 'taken',
          price:  null,
          tier:   'dns',
        }
      } catch {
        batch[domain] = { status: 'unknown', price: null, tier: 'static' }
      }
    })
  )
  console.info('[DomainBot] Tier 2: DNS-over-HTTPS ✓', domains.length, 'domains')
  return batch
}

/**
 * Single-domain live check via Worker (used by "Live check" button).
 * Returns { status, price, tier } or throws.
 */
export async function liveCheck(domain) {
  const res = await fetch(
    `${WORKER_URL}/check?domains=${encodeURIComponent(domain)}`,
    { signal: AbortSignal.timeout(8000) }
  )
  if (!res.ok) throw new Error(`Worker ${res.status}`)
  const data = await res.json()
  if (!data.results?.length) throw new Error('Empty')
  const r = data.results[0]
  return {
    status: r.available ? 'available' : 'taken',
    price:  r.price != null ? r.price / 1_000_000 : null,
    tier:   'verified',
  }
}
