/**
 * src/components/DomainCard.jsx
 * Card used in the Basic tab for available/premium domains.
 */

import { getLowestPrice, seoScore, scoreColor, getRegistrarPrices } from '../lib/pricing'

export function DomainCard({ domain, result, livePrices = {}, saved, onSave, onDetail }) {
  const { status } = result
  const [name, ...tldParts] = domain.split('.')
  const tld = '.' + tldParts.join('.')

  const price    = getLowestPrice(domain, livePrices)
  const seo      = seoScore(domain)
  const seoClr   = scoreColor(seo, 'seo')
  const cheapest = getRegistrarPrices(domain, livePrices)[0]

  // Dollar tier
  let dollarTier = 0, dollarColor = 'var(--text-dim)'
  if      (price <= 5)   { dollarTier = 1; dollarColor = 'var(--accent)' }
  else if (price <= 15)  { dollarTier = 2; dollarColor = '#84cc16' }
  else if (price <= 40)  { dollarTier = 3; dollarColor = '#f59e0b' }
  else if (price < 9999) { dollarTier = 4; dollarColor = '#ef4444' }

  const isPremium = status === 'premium'

  return (
    <div className={`domain-card ${isPremium ? 'card-premium' : 'card-available'}`}>
      <div className="card-name">
        <span className="card-keyword">{name}</span>
        <span className="card-tld">{tld}</span>
      </div>

      <div className="card-meta">
        {dollarTier > 0 && (
          <span className="card-price-tier" title={`~$${price.toFixed(2)}/yr`}>
            {[1, 2, 3, 4].map(i => (
              <span key={i} style={{
                color: i <= dollarTier ? dollarColor : 'var(--text-dim)',
                opacity: i <= dollarTier ? 1 : 0.25,
              }}>$</span>
            ))}
          </span>
        )}
        <span className="card-seo">
          <span className="card-seo-num" style={{ color: seoClr }}>{seo}</span>
          <span className="card-seo-label">SEO</span>
        </span>
      </div>

      <div className="card-divider" />
      <div className="card-actions">
        <span className={`card-dot ${isPremium ? 'premium' : 'available'}`} />
        <div className="card-btns">
          <button
            className={`card-icon-btn ${saved ? 'saved' : ''}`}
            onClick={e => { e.stopPropagation(); onSave(domain) }}
            title={saved ? 'Saved!' : 'Save domain'}
          >
            {saved ? '★' : '☆'}
          </button>
          <button
            className="card-icon-btn card-register"
            onClick={() => onDetail?.(domain)}
            title="View details"
          >
            →
          </button>
        </div>
      </div>
    </div>
  )
}
