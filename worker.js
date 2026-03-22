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

// ── Domain Health Snapshot ────────────────────────────────────────────────────

const DOH = 'https://cloudflare-dns.com/dns-query';
const PARKING_NS = ['sedo', 'sedoparking', 'parkingcrew', 'above.com', 'afternic', 'parking.godaddy', 'bodis.com', 'domainsponsor', 'smartname'];

async function dnsQuery(name, type) {
  const res = await fetch(`${DOH}?name=${encodeURIComponent(name)}&type=${type}`, {
    headers: { Accept: 'application/dns-json' },
    signal: AbortSignal.timeout(4000),
  });
  if (!res.ok) throw new Error(`DoH ${res.status}`);
  return res.json();
}

async function rdapQuery(domain) {
  const res = await fetch(`https://rdap.org/domain/${encodeURIComponent(domain)}`, {
    signal: AbortSignal.timeout(6000),
  });
  if (!res.ok) throw new Error(`RDAP ${res.status}`);
  return res.json();
}

async function checkDomainHealth(domain) {
  const [aResult, mxResult, nsResult, rdapResult] = await Promise.allSettled([
    dnsQuery(domain, 'A'),
    dnsQuery(domain, 'MX'),
    dnsQuery(domain, 'NS'),
    rdapQuery(domain),
  ]);

  // ── DNS A ──
  const aData      = aResult.status === 'fulfilled' ? aResult.value : null;
  const aAnswers   = aData?.Answer ?? [];
  const dns_present = aAnswers.length > 0;
  const resolves    = dns_present;

  // ── DNS MX ──
  const mxData    = mxResult.status === 'fulfilled' ? mxResult.value : null;
  const mx_records = (mxData?.Answer ?? []).length > 0;

  // ── DNS NS → parking detection ──
  const nsData   = nsResult.status === 'fulfilled' ? nsResult.value : null;
  const nsValues = (nsData?.Answer ?? []).map(r => (r.data || '').toLowerCase());
  const isParked = nsValues.some(ns => PARKING_NS.some(p => ns.includes(p)));

  // ── RDAP ──
  let age = 'unknown', registrar = null, privacy_protected = null;
  if (rdapResult.status === 'fulfilled') {
    const rdap = rdapResult.value;

    // Creation date
    const regEvent = (rdap.events ?? []).find(e => e.eventAction === 'registration');
    if (regEvent?.eventDate) {
      const years = (Date.now() - new Date(regEvent.eventDate).getTime()) / (1000 * 60 * 60 * 24 * 365);
      age = years < 1 ? 'new' : years < 5 ? 'established' : 'old';
    }

    // Registrar name
    const regEntity = (rdap.entities ?? []).find(e => (e.roles ?? []).includes('registrar'));
    if (regEntity) {
      registrar = regEntity.vcardArray?.[1]?.find(f => f[0] === 'fn')?.[3]
        ?? regEntity.handle ?? null;
    }

    // Privacy protection — registrant name redacted
    const registrant = (rdap.entities ?? []).find(e => (e.roles ?? []).includes('registrant'));
    if (registrant) {
      const fn = registrant.vcardArray?.[1]?.find(f => f[0] === 'fn')?.[3] ?? '';
      const remarks = (registrant.remarks ?? []).map(r => r.description ?? '').flat().join(' ');
      privacy_protected = /redact|privacy|protect|not disclosed/i.test(fn + ' ' + remarks);
    } else if (rdap.entities) {
      // Some registries omit the registrant entirely when privacy is on
      privacy_protected = true;
    }
  }

  // ── Signals ──
  const website = aResult.status === 'rejected' ? 'unknown' : dns_present ? 'active' : 'inactive';
  const email   = mxResult.status === 'rejected' ? 'unknown' : mx_records ? 'configured' : 'not_configured';

  // ── Risk flags ──
  const risk_flags = [];
  if (isParked)                risk_flags.push('parked_domain');
  if (dns_present && mx_records) risk_flags.push('heavily_used');
  if (risk_flags.length === 0) risk_flags.push('none');

  // ── Summary ──
  let summary;
  if (!dns_present && !mx_records) {
    summary = 'Available domain with no existing website or email setup.';
  } else if (isParked) {
    summary = 'Domain is registered but currently parked — no active content.';
  } else if (dns_present && mx_records) {
    summary = 'Taken domain with an active website and email — likely in use.';
  } else if (dns_present && !mx_records) {
    summary = 'Domain has an active website but no email configured.';
  } else {
    summary = 'Registered but inactive — potential resale or parked domain.';
  }

  return {
    domain,
    status: { website, email, age, registrar, privacy_protected },
    signals: { dns_present, mx_records, resolves },
    risk_flags,
    summary,
  };
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

      } else if (url.pathname === '/health') {
        const domain = (url.searchParams.get('domain') || '').trim().toLowerCase();
        if (!domain) return json({ error: 'No domain supplied.' }, 400, origin);
        const result = await checkDomainHealth(domain);
        return json(result, 200, origin);

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
