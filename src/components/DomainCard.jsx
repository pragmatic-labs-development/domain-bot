/**
 * src/components/DomainCard.jsx
 */

import { formatPrice } from '../lib/api'

export function DomainCard({ result }) {
  const { domain, available, price, currency } = result
  const [name, ...tldParts] = domain.split('.')
  const tld = '.' + tldParts.join('.')
  const formattedPrice = formatPrice(price, currency)

  const registrarUrl = `https://www.godaddy.com/domainsearch/find?domainToCheck=${encodeURIComponent(domain)}`

  return (
    <div className={`domain-card ${available ? 'available' : 'taken'}`}>
      <div className="domain-name">
        <span className="name-part">{name}</span>
        <span className="tld-part">{tld}</span>
      </div>

      <div className="domain-meta">
        {available ? (
          <>
            <span className="badge badge-available">Available</span>
            {formattedPrice && (
              <span className="price">{formattedPrice}/yr</span>
            )}
            <a
              href={registrarUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="buy-btn"
            >
              Register →
            </a>
          </>
        ) : (
          <span className="badge badge-taken">Taken</span>
        )}
      </div>
    </div>
  )
}
