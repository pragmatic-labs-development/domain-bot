/**
 * mock-server/index.js
 *
 * Local dev mock of the Cloudflare Worker.
 * Runs on port 3001. Vite proxies /api/* → here.
 *
 * Endpoints:
 *   GET /check?domains=example.com,example.io
 *   GET /suggest?query=myapp&tlds=com,io,ai
 *
 * To use REAL GoDaddy data locally, create a .env file at the project root:
 *   GODADDY_KEY=your_key
 *   GODADDY_SECRET=your_secret
 * and set USE_GODADDY=true below.
 */

import http from 'http'
import { URL } from 'url'

const PORT = 3001

// ── Config ────────────────────────────────────────────────────────────────────
const USE_GODADDY = false // flip to true + add .env to hit real API
const GODADDY_KEY    = process.env.GODADDY_KEY    || ''
const GODADDY_SECRET = process.env.GODADDY_SECRET || ''

// ── Mock helpers ──────────────────────────────────────────────────────────────

// Seeded pseudo-random so the same domain always gets the same mock result
function hashDomain(domain) {
  let h = 0
  for (const c of domain) h = (Math.imul(31, h) + c.charCodeAt(0)) | 0
  return Math.abs(h)
}

const PRICES = {
  com: 1299, net: 1099, org: 1099, io: 3999, ai: 8999,
  app: 1999, co: 2999, dev: 1499, xyz: 999, tech: 2999,
  shop: 2499, store: 2499, online: 1999, site: 1999,
}

function mockResult(domain) {
  const h = hashDomain(domain)
  const tld = domain.split('.').slice(1).join('.')
  const available = h % 3 !== 0          // ~67% available
  const price = PRICES[tld] ?? 1999
  const jitter = ((h % 500) - 250)       // ±$2.50 noise
  return {
    domain,
    available,
    price: available ? (price + jitter) * 1000 : null, // micro-units
    currency: 'USD',
    definitive: true,
  }
}

// ── Real GoDaddy call ─────────────────────────────────────────────────────────
async function godaddyCheck(domains) {
  const res = await fetch(
    'https://api.godaddy.com/v1/domains/available?checkType=FAST',
    {
      method: 'POST',
      headers: {
        Authorization: `sso-key ${GODADDY_KEY}:${GODADDY_SECRET}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(domains),
    }
  )
  if (!res.ok) throw new Error(`GoDaddy ${res.status}: ${await res.text()}`)
  const data = await res.json()
  const results = Array.isArray(data.domains) ? data.domains : [data]
  return results.map(d => ({
    domain: d.domain,
    available: d.available === true,
    price: d.price ?? null,
    currency: d.currency ?? 'USD',
    definitive: d.definitive ?? true,
  }))
}

// ── HTTP server ───────────────────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`)

  // CORS (for direct browser hits if ever needed)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Content-Type', 'application/json')

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return }
  if (req.method !== 'GET')     { res.writeHead(405); res.end(JSON.stringify({ error: 'Method not allowed' })); return }

  let domains = []

  if (url.pathname === '/check') {
    const raw = url.searchParams.get('domains') || ''
    domains = raw.split(',').map(d => d.trim().toLowerCase()).filter(Boolean)

  } else if (url.pathname === '/suggest') {
    const query = (url.searchParams.get('query') || '').toLowerCase().replace(/[^a-z0-9-]/g, '')
    const tlds  = (url.searchParams.get('tlds')  || 'com,net,org,io,ai,app,co,dev,xyz,tech').split(',')
    domains = tlds.map(t => `${query}.${t.trim()}`)

  } else {
    res.writeHead(404)
    res.end(JSON.stringify({ error: 'Unknown endpoint. Use /check or /suggest.' }))
    return
  }

  if (!domains.length) { res.writeHead(400); res.end(JSON.stringify({ error: 'No domains supplied.' })); return }
  if (domains.length > 500) { res.writeHead(400); res.end(JSON.stringify({ error: 'Max 500 domains.' })); return }

  try {
    // Simulate network latency in mock mode so UI loading states are visible
    const results = USE_GODADDY
      ? await godaddyCheck(domains)
      : await new Promise(resolve => {
          setTimeout(() => resolve(domains.map(mockResult)), 300 + Math.random() * 400)
        })

    res.writeHead(200)
    res.end(JSON.stringify({ results }))
  } catch (err) {
    console.error('[mock-server]', err.message)
    res.writeHead(502)
    res.end(JSON.stringify({ error: err.message }))
  }
})

server.listen(PORT, () => {
  console.log(`[mock-server] Running on http://localhost:${PORT}`)
  if (USE_GODADDY) {
    console.log('[mock-server] → Using REAL GoDaddy API')
  } else {
    console.log('[mock-server] → Using MOCK data (set USE_GODADDY=true to use real API)')
  }
})
