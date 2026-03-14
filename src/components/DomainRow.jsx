/**
 * src/components/DomainRow.jsx
 * Row used in the Advanced tab — shows all domains with status, scores, actions.
 */

import { getLowestPrice, seoScore, botScore, scoreColor, getRegistrarPrices } from '../lib/pricing'

export function DomainRow({ domain, result, livePrices = {}, saved, onSave, onLiveCheck, index = 0 }) {
  const { status, tier } = result

  const isChecking  = status === 'checking'
  const isAvailable = status === 'available'
  const isTaken     = status === 'taken'
  const isAftermarket = status === 'aftermarket'

  const [name, ...tldParts] = domain.split('.')
  const tld = '.' + tldParts.join('.')

  const seo  = seoScore(domain)
  const bot  = botScore(domain, livePrices)
  const price = getLowestPrice(domain, livePrices)
  const registrars = isAvailable ? getRegistrarPrices(domain, livePrices) : []
  const cheapest = registrars[0]

  const rowClass = isChecking ? 'domain-row row-checking'
    : isAftermarket ? 'domain-row row-aftermarket'
    : `domain-row row-${status}`

  const isVerified = tier === 'verified' || tier === 'godaddy'

  if (isChecking) {
    return (
      <div className="domain-row row-checking" style={{ animationDelay: `${index * 35}ms` }}>
        <div className="dns-spinner" />
        <div className="domain-label">{domain}</div>
        <div className="row-actions"><span className="dns-checking-label">Checking…</span></div>
      </div>
    )
  }

  return (
    <div className={rowClass} style={{ animationDelay: `${index * 35}ms` }}>
      <div className={`status-dot ${isVerified ? 'verified' : status}`} />

      <div className={`domain-label ${isTaken ? 'taken-label' : ''}`}>
        {name}<span className="domain-tld-muted">{tld}</span>
        {isVerified && <span className="data-tier-badge tier-live">Live</span>}
        {tier === 'dns' && <span className="data-tier-badge tier-dns">DNS</span>}
      </div>

      <div className="row-actions">
        {isAvailable && cheapest && (
          <span className="domain-price" style={{ color: 'var(--accent)', fontSize: '0.75rem', fontWeight: 500 }}>
            ${cheapest.price.toFixed(2)}/yr
          </span>
        )}

        <ScoreRing score={seo} color={scoreColor(seo, 'seo')} label="SEO" />
        <ScoreRing score={bot} color={scoreColor(bot, 'bot')} label="Bot" />

        <button
          className={`save-btn ${saved ? 'saved' : ''}`}
          onClick={e => { e.stopPropagation(); onSave(domain) }}
          title={saved ? 'Saved!' : 'Save domain'}
        >
          {saved ? '★' : '☆'}
        </button>

        {!isVerified && (isAvailable || isTaken || status === 'unknown') && (
          <button
            className="lock-btn"
            onClick={e => { e.stopPropagation(); onLiveCheck(domain) }}
            title="Get authoritative availability + live price from GoDaddy"
          >
            <LockIcon /> {isTaken ? 'Check status' : 'Live check'}
          </button>
        )}
        {isVerified && <span className="verified-badge">Verified</span>}

        {isAvailable && cheapest && (
          <button className="row-btn continue" onClick={() => window.open(cheapest.url(domain), '_blank')}>
            Register →
          </button>
        )}
        {isTaken && (
          <button className="row-btn lookup" onClick={() => window.open(`https://lookup.icann.org/en/lookup?name=${domain}`, '_blank')}>
            WHOIS
          </button>
        )}
        {isAftermarket && (
          <button className="row-btn offer" onClick={() => window.open(`https://www.godaddy.com/domainsearch/find?domainToCheck=${domain}`, '_blank')}>
            Make offer
          </button>
        )}
      </div>
    </div>
  )
}

function ScoreRing({ score, color, label }) {
  const r    = 15
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  return (
    <div className="score-ring" title={`${label} Score: ${score}/99`}>
      <svg width="38" height="38" viewBox="0 0 38 38" style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}>
        <circle className="score-ring-bg" cx="19" cy="19" r={r} />
        <circle
          className="score-ring-fill"
          cx="19" cy="19" r={r}
          stroke={color}
          strokeDasharray={circ.toFixed(2)}
          strokeDashoffset={offset.toFixed(2)}
        />
      </svg>
      <div className="score-ring-num" style={{ color }}>{score}</div>
    </div>
  )
}

function LockIcon() {
  return (
    <svg width="9" height="9" viewBox="0 0 12 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <rect x="1.5" y="6" width="9" height="7" rx="1.5"/>
      <path d="M3.5 6V4a2.5 2.5 0 015 0v2"/>
    </svg>
  )
}
