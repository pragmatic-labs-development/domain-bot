/**
 * src/components/PrimaryDomainCard.jsx
 * The large featured domain card shown above results.
 */

import { useState } from 'react'
import { getRegistrarPrices } from '../lib/pricing'

export function PrimaryDomainCard({ domain, result, livePrices, onLiveCheck }) {
  const [dropdownOpen, setDropdownOpen] = useState(false)

  if (!domain) return null

  const status = result?.status ?? 'checking'
  const registrarPrices = status === 'available' ? getRegistrarPrices(domain, livePrices) : []
  const cheapest = registrarPrices[0]

  const [namePart, ...tldParts] = domain.split('.')
  const tld = '.' + tldParts.join('.')

  return (
    <div className={`primary-domain status-${status}`}>
      {/* Badge row */}
      <div className="primary-badge-row">
        {status === 'checking' ? (
          <span className="primary-badge badge-checking">
            <span className="dns-inline-spinner" />
            Checking…
          </span>
        ) : status === 'available' ? (
          <span className="primary-badge badge-available">
            <CheckIcon /> Available
          </span>
        ) : status === 'taken' ? (
          <span className="primary-badge badge-taken">
            <XIcon /> Already Taken
          </span>
        ) : (
          <span className="primary-badge badge-checking">Unknown</span>
        )}
        {cheapest && <span className="primary-badge-sub">via {cheapest.name}</span>}
      </div>

      {/* Main row */}
      <div className="primary-main">
        <div className="primary-domain-name">
          <span className="primary-name-part">{namePart}</span>
          <span className="primary-tld-part">{tld}</span>
        </div>

        <div className="primary-actions">
          {status === 'checking' && (
            <span className="primary-checking-label">Checking availability…</span>
          )}

          {status === 'available' && cheapest && (
            <>
              <div className="primary-price-block">
                <span className="primary-price-label">For first year</span>
                <span className="primary-price-main">${cheapest.price.toFixed(2)}/yr</span>
              </div>
              <div className="register-wrap">
                <button
                  className="register-main"
                  onClick={() => window.open(cheapest.url(domain), '_blank')}
                >
                  Register {domain} →
                </button>
                <button
                  className="register-caret"
                  onClick={() => setDropdownOpen(o => !o)}
                  aria-label="More registrars"
                >▾</button>
                {dropdownOpen && (
                  <div className="register-dropdown">
                    {registrarPrices.map(r => (
                      <div
                        key={r.name}
                        className="dropdown-item"
                        onClick={() => { window.open(r.url(domain), '_blank'); setDropdownOpen(false) }}
                      >
                        <span className="registrar-name">{r.name}</span>
                        <span className="registrar-price">${r.price.toFixed(2)}/yr</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {status === 'taken' && (
            <button
              className="action-btn"
              onClick={() => window.open(`https://who.is/whois/${domain}`, '_blank')}
            >
              WHOIS lookup →
            </button>
          )}

          {(status === 'unknown' || !status) && (
            <button className="action-btn" onClick={() => onLiveCheck(domain)}>
              <LockIcon /> Live check
            </button>
          )}
        </div>
      </div>

      {/* Footer */}
      {status === 'available' && (
        <div className="primary-footer">
          <CheckIcon size={14} />
          Short, memorable domains build brand recognition and drive more direct traffic.
        </div>
      )}
      {status === 'taken' && (
        <div className="primary-footer footer-taken">
          <InfoIcon size={14} />
          This domain is registered. Check the alternatives below, or try a different TLD.
        </div>
      )}
    </div>
  )
}

function CheckIcon({ size = 11 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <path d="m20 6-11 11-5-5"/>
    </svg>
  )
}
function XIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <path d="M18 6 6 18M6 6l12 12"/>
    </svg>
  )
}
function LockIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <rect x="1.5" y="6" width="9" height="7" rx="1.5"/>
      <path d="M3.5 6V4a2.5 2.5 0 015 0v2"/>
    </svg>
  )
}
function InfoIcon({ size = 11 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
    </svg>
  )
}
