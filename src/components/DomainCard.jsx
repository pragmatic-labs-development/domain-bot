/**
 * src/components/DomainCard.jsx
 * Card used in the Basic tab for available/premium domains.
 */

import { getLowestPrice, seoScore, scoreColor } from '../lib/pricing'

export function DomainCard({ domain, result, livePrices = {}, saved, onSave }) {
  const { status } = result
  const [name, ...tldParts] = domain.split('.')
  const tld = '.' + tldParts.join('.')

  const price = getLowestPrice(domain, livePrices)
  const seo   = seoScore(domain)
  const seoClr = scoreColor(seo, 'seo')

  // Dollar tier
  let dollarTier = 0, dollarColor = 'var(--text-dim)'
  if      (price <= 5)   { dollarTier = 1; dollarColor = '#10d98a' }
  else if (price <= 15)  { dollarTier = 2; dollarColor = '#84cc16' }
  else if (price <= 40)  { dollarTier = 3; dollarColor = '#f59e0b' }
  else if (price < 9999) { dollarTier = 4; dollarColor = '#ef4444' }

  const isPremium = status === 'premium'
  const cardClass = isPremium ? 'domain-card card-premium' : 'domain-card card-available'

  return (
    <div className={cardClass}>
      <div className="card-name">
        <span>{name}</span>
        <span className="card-tld">{tld}</span>
      </div>
      <div className="card-meta">
        {dollarTier > 0 && (
          <span className="card-price-tier" title={`~$${price.toFixed(2)}/yr`}>
            {[1,2,3,4].map(i => (
              <span key={i} style={{ opacity: i <= dollarTier ? 1 : 0.2, color: i <= dollarTier ? dollarColor : 'var(--text-dim)' }}>$</span>
            ))}
          </span>
        )}
        <span className="card-seo" style={{ color: seoClr }} title="SEO Score">{seo} SEO</span>
      </div>
      <div className="card-actions">
        <span className={`card-dot ${isPremium ? 'premium' : 'available'}`} />
        <button
          className={`card-save-btn ${saved ? 'saved' : ''}`}
          onClick={e => { e.stopPropagation(); onSave(domain) }}
          title={saved ? 'Saved!' : 'Save'}
        >
          {saved ? '★' : '☆'}
        </button>
      </div>
    </div>
  )
}
