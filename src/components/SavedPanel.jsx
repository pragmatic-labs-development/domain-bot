/**
 * src/components/SavedPanel.jsx
 * Slide-in drawer showing saved domains.
 */

import { useEffect } from 'react'
import { getRegistrarPrices } from '../lib/pricing'

const STATUS_COLOR = {
  available:   'var(--green)',
  premium:     'var(--yellow)',
  aftermarket: 'var(--blue)',
  taken:       'var(--red)',
  unknown:     'var(--text-dim)',
}

const STATUS_LABEL = {
  available:   'Available',
  premium:     'Premium',
  aftermarket: 'Aftermarket',
  taken:       'Taken',
  unknown:     'Unknown',
}

export function SavedPanel({ saved, onUnsave, onClose, livePrices = {}, results = {}, onDetail }) {
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <>
      <div className="saved-backdrop" onClick={onClose} />

      <div className="saved-panel">
        <div className="saved-panel-header">
          <div className="saved-panel-title">
            <StarFilledIcon />
            Saved Domains
            {saved.length > 0 && (
              <span className="saved-count-badge">{saved.length}</span>
            )}
          </div>
          <div className="saved-header-actions">
            {saved.length > 0 && (
              <button
                className="saved-clear-btn"
                onClick={() => saved.forEach(d => onUnsave(d))}
              >
                Clear all
              </button>
            )}
            <button className="saved-close-btn" onClick={onClose} aria-label="Close">
              <CloseIcon />
            </button>
          </div>
        </div>

        <div className="saved-panel-body">
          {saved.length === 0 ? (
            <div className="saved-empty">
              <div className="saved-empty-icon"><BookmarkEmptyIcon /></div>
              <p className="saved-empty-title">No saved domains yet</p>
              <p className="saved-empty-sub">
                Bookmark any domain from search results to save it here for later.
              </p>
            </div>
          ) : (
            <div className="saved-list">
              {saved.map(domain => {
                const [name, ...tldParts] = domain.split('.')
                const tld = '.' + tldParts.join('.')
                const result = results[domain]
                const status = result?.status ?? 'unknown'
                const isTaken = status === 'taken'
                const isAvailable = status === 'available' || status === 'premium'
                const isAftermarket = status === 'aftermarket'
                const statusColor = STATUS_COLOR[status] ?? STATUS_COLOR.unknown
                const statusLabel = STATUS_LABEL[status] ?? 'Unknown'
                const registrars = getRegistrarPrices(domain, livePrices)
                const cheapest = registrars[0]

                return (
                  <div key={domain} className="saved-item">
                    <div className="saved-item-left">
                      <span
                        className="saved-item-dot"
                        style={{ background: statusColor }}
                        title={statusLabel}
                      />
                      <div className="saved-item-name">
                        <span className="saved-item-keyword">{name}</span>
                        <span className="saved-item-tld" style={{ color: statusColor }}>{tld}</span>
                      </div>
                      {status !== 'unknown' && (
                        <span className="saved-item-status" style={{ color: statusColor }}>
                          {statusLabel}
                        </span>
                      )}
                    </div>

                    <div className="saved-item-actions">
                      {cheapest && isAvailable && (
                        <span className="saved-item-price">${cheapest.price.toFixed(2)}/yr</span>
                      )}

                      {/* Register CTA — only for available/premium */}
                      {isAvailable && cheapest && (
                        <button
                          className="saved-item-btn saved-register"
                          onClick={() => window.open(cheapest.url(domain), '_blank')}
                          title={`Register at ${cheapest.name}`}
                        >
                          Register →
                        </button>
                      )}

                      {/* WHOIS — for taken */}
                      {isTaken && (
                        <button
                          className="saved-item-btn saved-whois"
                          onClick={() => window.open(`https://who.is/whois/${domain}`, '_blank')}
                          title="WHOIS lookup"
                        >
                          WHOIS →
                        </button>
                      )}

                      {/* GoDaddy — for aftermarket */}
                      {isAftermarket && (
                        <button
                          className="saved-item-btn saved-whois"
                          onClick={() => window.open(`https://www.godaddy.com/domainsearch/find?domainToCheck=${domain}`, '_blank')}
                          title="Make offer on GoDaddy"
                        >
                          Offer →
                        </button>
                      )}

                      {/* Eye — view details */}
                      {onDetail && (
                        <button
                          className="saved-item-icon-btn"
                          onClick={() => onDetail(domain)}
                          title="View details"
                          aria-label="View domain details"
                        >
                          <EyeIcon />
                        </button>
                      )}

                      {/* Trash — remove */}
                      <button
                        className="saved-item-icon-btn saved-trash"
                        onClick={() => onUnsave(domain)}
                        title="Remove from saved"
                        aria-label="Remove from saved"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="saved-panel-footer">
          <span className="saved-footer-note">
            <LockIcon /> Saved locally in your browser
          </span>
        </div>
      </div>
    </>
  )
}

function StarFilledIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
    </svg>
  )
}
function BookmarkEmptyIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
    </svg>
  )
}
function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M18 6 6 18M6 6l12 12"/>
    </svg>
  )
}
function LockIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 12 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <rect x="1.5" y="6" width="9" height="7" rx="1.5"/>
      <path d="M3.5 6V4a2.5 2.5 0 015 0v2"/>
    </svg>
  )
}
function EyeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  )
}
function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6M14 11v6"/>
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  )
}
