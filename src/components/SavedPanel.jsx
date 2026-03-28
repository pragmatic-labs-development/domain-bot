/**
 * src/components/SavedPanel.jsx
 * Slide-in drawer showing saved domains.
 */

import { useEffect, useState } from 'react'
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

export function SavedPanel({ saved, onUnsave, onClose, livePrices = {}, results = {}, onDetail, onLiveCheck }) {
  const [confirmClear, setConfirmClear] = useState(false)

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
            {saved.length > 0 && !confirmClear && (
              <button
                className="saved-clear-btn"
                onClick={() => setConfirmClear(true)}
              >
                Clear all
              </button>
            )}
            {confirmClear && (
              <div className="saved-clear-confirm">
                <span className="saved-clear-confirm-text">Remove all {saved.length}?</span>
                <button className="saved-clear-btn saved-clear-yes" onClick={() => { saved.forEach(d => onUnsave(d)); setConfirmClear(false) }}>Yes, clear</button>
                <button className="saved-clear-cancel" onClick={() => setConfirmClear(false)}>Cancel</button>
              </div>
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
              {saved.map(domain => (
                <SavedItem
                  key={domain}
                  domain={domain}
                  result={results[domain]}
                  livePrices={livePrices}
                  onDetail={onDetail}
                  onUnsave={onUnsave}
                  onLiveCheck={onLiveCheck}
                />
              ))}
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

function SavedItem({ domain, result, livePrices, onDetail, onUnsave, onLiveCheck }) {
  const [isUnlocking, setIsUnlocking] = useState(false)

  const [name, ...tldParts] = domain.split('.')
  const tld = '.' + tldParts.join('.')
  const status = result?.status ?? 'unknown'
  const isVerified = result?.tier === 'verified' || result?.tier === 'godaddy'
  const isTaken = status === 'taken'
  const isAvailable = status === 'available' || status === 'premium'
  const isAftermarket = status === 'aftermarket'
  const statusColor = STATUS_COLOR[status] ?? STATUS_COLOR.unknown
  const statusLabel = STATUS_LABEL[status] ?? 'Unknown'
  const registrars = getRegistrarPrices(domain, livePrices)
  const cheapest = registrars[0]

  function handleLock() {
    if (isVerified || isUnlocking) return
    setIsUnlocking(true)
    onLiveCheck?.(domain)?.finally(() => setIsUnlocking(false))
  }

  return (
    <div className="saved-item">
      <div className="saved-item-left">
        <span className="saved-item-dot" style={{ background: statusColor }} title={statusLabel} />
        <div className="saved-item-name">
          <span className="saved-item-keyword">{name}</span>
          <span className="saved-item-tld" style={{ color: statusColor }}>{tld}</span>
        </div>
        {status !== 'unknown' && (
          <span className="saved-item-status" style={{ color: statusColor }}>{statusLabel}</span>
        )}
      </div>

      <div className="saved-item-actions">
        {cheapest && isAvailable && (
          <span className="saved-item-price">${cheapest.price.toFixed(2)}/yr</span>
        )}

        {isAvailable && cheapest && (
          <button className="saved-item-btn saved-register" onClick={() => window.open(cheapest.url(domain), '_blank')} title={`Register at ${cheapest.name}`}>
            Register →
          </button>
        )}
        {isTaken && (
          <button className="saved-item-btn saved-whois" onClick={() => window.open(`https://who.is/whois/${domain}`, '_blank')} title="WHOIS lookup">
            WHOIS →
          </button>
        )}
        {isAftermarket && (
          <button className="saved-item-btn saved-whois" onClick={() => window.open(`https://www.godaddy.com/domainsearch/find?domainToCheck=${domain}`, '_blank')} title="Make offer">
            Offer →
          </button>
        )}

        {/* Lock — live check */}
        {!isAftermarket && onLiveCheck && (
          <button
            className={`saved-item-icon-btn ${isVerified ? 'saved-lock-verified' : ''}`}
            onClick={handleLock}
            disabled={isVerified || isUnlocking}
            title={isVerified ? 'Live data loaded' : isUnlocking ? 'Checking…' : 'Live check — real-time availability + pricing'}
          >
            {isVerified ? <LockOpenIcon /> : isUnlocking ? <MiniSpinner /> : <LockIcon />}
          </button>
        )}

        {onDetail && (
          <button className="saved-item-icon-btn" onClick={() => onDetail(domain)} title="View details" aria-label="View domain details">
            <EyeIcon />
          </button>
        )}

        <button className="saved-item-icon-btn saved-trash" onClick={() => onUnsave(domain)} title="Remove from saved" aria-label="Remove from saved">
          <TrashIcon />
        </button>
      </div>
    </div>
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
    <svg width="12" height="12" viewBox="0 0 12 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <rect x="1.5" y="6" width="9" height="7" rx="1.5"/>
      <path d="M3.5 6V4a2.5 2.5 0 015 0v2"/>
    </svg>
  )
}
function LockOpenIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <rect x="1.5" y="6" width="9" height="7" rx="1.5"/>
      <path d="M3.5 6V4a2.5 2.5 0 014.95-1"/>
    </svg>
  )
}
function MiniSpinner() {
  return <div className="dns-spinner" style={{ width: 11, height: 11, borderWidth: 1.5 }} />
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
