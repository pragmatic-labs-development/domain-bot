/**
 * Domain Bot — Cloudflare Worker
 * Proxies requests to the GoDaddy Domains API.
 *
 * Secrets (set via Cloudflare dashboard or wrangler):
 *   GODADDY_KEY    — your GoDaddy API key
 *   GODADDY_SECRET — your GoDaddy API secret
 *
 * Endpoints this Worker exposes:
 *   GET  /check?domains=example.com,example.io,example.ai
 *        → { results: [ { domain, available, price, currency, definitive }, ... ] }
 *
 *   GET  /suggest?query=myapp&tlds=com,io,ai,app,co,dev
 *        → same shape, for convenience
 */

const ALLOWED_ORIGINS = [
  // Add your production domain here, e.g. 'https://domainbot.com'
  // Wildcard '*' is fine during development
];

const GODADDY_API = 'https://api.godaddy.com/v1';

// ── CORS helpers ──────────────────────────────────────────────────────────────

function corsHeaders(origin) {
  // Allow file:// (origin = 'null'), localhost, and any configured domains.
  // When ALLOWED_ORIGINS is empty we allow everything — tighten once hosted.
  const allowed =
    ALLOWED_ORIGINS.length === 0 ||
    !origin ||
    origin === 'null' ||
    ALLOWED_ORIGINS.includes(origin) ||
    ALLOWED_ORIGINS.includes('*');

  return {
    'Access-Control-Allow-Origin': allowed ? '*' : '',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

function json(data, status = 200, origin = '*') {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(origin),
    },
  });
}

// ── GoDaddy API call ──────────────────────────────────────────────────────────

/**
 * Check availability for up to 500 domains in one batch call.
 * GoDaddy returns availability + price per domain.
 */
async function checkAvailability(domains, env) {
  const key    = env.GODADDY_KEY;
  const secret = env.GODADDY_SECRET;

  if (!key || !secret) {
    throw new Error('Missing GODADDY_KEY or GODADDY_SECRET environment secrets.');
  }

  // GoDaddy bulk endpoint: POST /v1/domains/available
  const res = await fetch(`${GODADDY_API}/domains/available?checkType=FAST`, {
    method: 'POST',
    headers: {
      'Authorization': `sso-key ${key}:${secret}`,
      'Content-Type':  'application/json',
      'Accept':        'application/json',
    },
    body: JSON.stringify(domains),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`GoDaddy API error ${res.status}: ${errText}`);
  }

  const data = await res.json();

  // GoDaddy bulk response shape:
  // { domains: [ { domain, available, price, currency, definitive, ... }, ... ] }
  // (single domain POST returns the object directly, not wrapped)
  const results = Array.isArray(data.domains) ? data.domains : [data];

  return results.map(d => ({
    domain:      d.domain,
    available:   d.available === true,
    price:       d.price      ?? null,   // price in micro-units (divide by 1,000,000)
    currency:    d.currency   ?? 'USD',
    definitive:  d.definitive ?? true,
  }));
}

// ── Request router ────────────────────────────────────────────────────────────

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const url    = new URL(request.url);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    if (request.method !== 'GET') {
      return json({ error: 'Method not allowed' }, 405, origin);
    }

    try {
      let domains = [];

      if (url.pathname === '/check') {
        // ?domains=example.com,example.io
        const raw = url.searchParams.get('domains') || '';
        domains = raw.split(',').map(d => d.trim().toLowerCase()).filter(Boolean);

      } else if (url.pathname === '/suggest') {
        // ?query=myapp&tlds=com,io,ai,app,co,dev,net,org,xyz,shop,tech,store
        const query = (url.searchParams.get('query') || '').toLowerCase().replace(/[^a-z0-9-]/g, '');
        const tlds  = (url.searchParams.get('tlds')  || 'com,net,org,io,ai,app,co,dev,xyz,tech').split(',');
        domains = tlds.map(t => `${query}.${t.trim()}`);

      } else {
        return json({ error: 'Unknown endpoint. Use /check or /suggest.' }, 404, origin);
      }

      if (domains.length === 0) {
        return json({ error: 'No domains supplied.' }, 400, origin);
      }

      if (domains.length > 500) {
        return json({ error: 'Max 500 domains per request.' }, 400, origin);
      }

      const results = await checkAvailability(domains, env);
      return json({ results }, 200, origin);

    } catch (err) {
      console.error(err);
      return json({ error: err.message }, 502, origin);
    }
  },
};
