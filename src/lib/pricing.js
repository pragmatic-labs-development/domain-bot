/**
 * src/lib/pricing.js
 * Registrar pricing, SEO/Bot scores — ported from domain-bot.com
 */

export const REGISTRARS = [
  {
    name: 'Namecheap', abbr: 'NC', color: '#de3723',
    basePrices: { com:9.98, net:12.98, org:13.98, ai:79.98, io:39.98, app:19.98, co:29.98, dev:14.98, xyz:3.98, info:4.98, shop:4.98, tech:8.98, store:4.98, site:2.88, online:4.98, pro:4.98, lol:9.98, live:6.98, cloud:9.98, media:14.98 },
    url: d => `https://www.namecheap.com/domains/registration/results/?domain=${d}`,
  },
  {
    name: 'GoDaddy', abbr: 'GD', color: '#1bdbdb',
    basePrices: { com:12.99, net:14.99, org:9.99, ai:89.99, io:44.99, app:22.99, co:34.99, dev:19.99, xyz:1.99, info:5.99, shop:5.99, tech:9.99, store:5.99, site:3.99, online:5.99, pro:5.99, lol:11.99, live:7.99, cloud:11.99, media:16.99 },
    url: d => `https://www.godaddy.com/domainsearch/find?domainToCheck=${d}`,
  },
  {
    name: 'Hostinger', abbr: 'HO', color: '#7b3fe4',
    basePrices: { com:9.99, net:12.99, org:11.99, ai:74.99, io:37.99, app:18.99, co:27.99, dev:13.99, xyz:2.99, info:3.99, shop:3.99, tech:7.99, store:3.99, site:1.99, online:3.99, pro:3.99, lol:8.99, live:5.99, cloud:8.99, media:12.99 },
    url: d => `https://www.hostinger.com/domain-name-search?domain=${d}`,
  },
  {
    name: 'Spaceship', abbr: 'SS', color: '#4f8ef7',
    basePrices: { com:8.88, net:11.88, org:10.88, ai:69.88, io:35.88, app:17.88, co:25.88, dev:12.88, xyz:2.88, info:3.88, shop:3.88, tech:7.88, store:3.88, site:1.88, online:3.88, pro:3.88, lol:8.88, live:5.88, cloud:8.88, media:11.88 },
    url: d => `https://www.spaceship.com/domain-search/?q=${d}`,
  },
  {
    name: 'Porkbun', abbr: 'PB', color: '#f06292',
    basePrices: { com:10.37, net:13.37, org:12.37, ai:76.37, io:40.37, app:20.37, co:30.37, dev:15.37, xyz:4.37, info:5.37, shop:5.37, tech:9.37, store:5.37, site:3.37, online:5.37, pro:5.37, lol:10.37, live:7.37, cloud:10.37, media:15.37 },
    url: d => `https://porkbun.com/checkout/search?q=${d}`,
  },
]

/**
 * Get sorted registrar prices for a domain.
 * livePrices: { [domain]: priceUSD } from GoDaddy API (optional)
 */
export function getRegistrarPrices(domain, livePrices = {}) {
  const ext = domain.split('.').slice(1).join('.')
  return REGISTRARS.map(r => {
    const price = (r.abbr === 'GD' && livePrices[domain] != null)
      ? livePrices[domain]
      : (r.basePrices[ext] ?? null)
    return { ...r, price }
  }).filter(r => r.price !== null).sort((a, b) => a.price - b.price)
}

export function getLowestPrice(domain, livePrices = {}) {
  const prices = getRegistrarPrices(domain, livePrices)
  return prices.length > 0 ? prices[0].price : 9999
}

export function seoScore(domain) {
  const name = domain.split('.')[0]
  const ext  = domain.split('.').slice(1).join('.')
  let score = 0

  const len = name.length
  if      (len <= 5)  score += 28
  else if (len <= 8)  score += 22
  else if (len <= 12) score += 14
  else if (len <= 16) score += 7
  else                score += 2

  const tldScores = { com:22, org:18, net:15, io:14, ai:13, app:12, co:11, dev:11, xyz:5, info:5, shop:7, tech:8, store:6, site:5, online:5, pro:8, lol:3, live:6, cloud:7, media:8 }
  score += tldScores[ext] || 4

  if (!/[-0-9]/.test(name)) score += 10

  const vowels = (name.match(/[aeiou]/gi) || []).length
  const ratio = vowels / name.length
  if      (ratio >= 0.3 && ratio <= 0.6) score += 12
  else if (ratio > 0 && ratio < 0.8)     score += 6

  if (len <= 6 && !/[-0-9]/.test(name)) score += 8

  let h = 0
  for (let i = 0; i < domain.length; i++) h = (h * 31 + domain.charCodeAt(i)) >>> 0
  score += h % 10

  return Math.min(100, Math.max(18, score))
}

export function botScore(domain, livePrices = {}) {
  const name = domain.split('.')[0]
  const ext  = domain.split('.').slice(1).join('.')
  const len  = name.length

  let h = 0
  for (let i = 0; i < domain.length; i++) h = (h * 31 + domain.charCodeAt(i)) >>> 0

  const tldPop = { com:95, net:72, org:68, io:65, ai:72, app:60, co:58, dev:58, xyz:28, info:25, shop:38, tech:42, store:35, site:28, online:30, pro:45, lol:18, live:38, cloud:42, media:45 }
  let popularity = tldPop[ext] || 20
  if      (len <= 4)  popularity = Math.min(100, popularity + 15)
  else if (len <= 6)  popularity = Math.min(100, popularity + 8)
  else if (len > 12)  popularity = Math.max(0, popularity - 10)
  popularity = Math.min(100, Math.max(5, popularity + (h % 8)))

  const seoTrust = seoScore(domain)

  const lowestPrice = getLowestPrice(domain, livePrices)
  let priceAfford
  if      (lowestPrice <= 2)  priceAfford = 100
  else if (lowestPrice <= 5)  priceAfford = 90
  else if (lowestPrice <= 10) priceAfford = 78
  else if (lowestPrice <= 15) priceAfford = 65
  else if (lowestPrice <= 25) priceAfford = 50
  else if (lowestPrice <= 40) priceAfford = 35
  else if (lowestPrice <= 80) priceAfford = 20
  else                        priceAfford = 10

  const vowels = (name.match(/[aeiou]/gi) || []).length
  const vratio = vowels / name.length
  let memorability = 0
  if      (len <= 4)  memorability += 50
  else if (len <= 6)  memorability += 40
  else if (len <= 8)  memorability += 28
  else if (len <= 11) memorability += 16
  else                memorability += 5
  if (!/[-0-9]/.test(name)) memorability += 25
  if (vratio >= 0.25 && vratio <= 0.65) memorability += 22
  else if (vratio > 0) memorability += 8
  memorability += ((h * 13) % 13)
  memorability = Math.min(100, Math.max(5, memorability))

  const raw = (popularity * 0.4) + (seoTrust * 0.3) + (priceAfford * 0.2) + (memorability * 0.1)
  return Math.round(Math.min(99, Math.max(10, raw)))
}

/** Score ring color thresholds used across components */
export function scoreColor(score, type = 'bot') {
  if (type === 'seo') {
    if (score >= 75) return '#22c55e'
    if (score >= 50) return '#f59e0b'
    return '#ef4444'
  }
  if (score >= 75) return '#00e5c8'
  if (score >= 55) return '#84cc16'
  if (score >= 38) return '#f59e0b'
  return '#ef4444'
}
