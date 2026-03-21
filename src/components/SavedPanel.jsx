/**
 * src/components/SavedPanel.jsx
 * Slide-in drawer showing saved domains.
 */

import { useEffect } from 'react'
import { getRegistrarPrices } from '../lib/pricing'

export function SavedPanel({ saved, onUnsave, onClose, livePrices = {} }) {
  // Close on Escape
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <>
      {/* Backdrop */}
      <div className="saved-backdrop" onClick={onClose} />

      {/* Drawer */}
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
                onClick={() => { saved.forEach(d => onUnsave(d)) }}
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
                const registrars = getRegistrarPrices(domain, livePrices)
                const cheapest = registrars[0]

                return (
                  <div key={domain} className="saved-item">
                    <div className="saved-item-name">
                      <span className="saved-item-keyword">{name}</span>
                      <span className="saved-item-tld">{tld}</span>
                    </div>

                    <div className="saved-item-actions">
                      {cheapest && (
                        <span className="saved-item-price">${cheapest.price.toFixed(2)}/yr</span>
                      )}
                      {cheapest && (
                        <button
                          className="saved-item-btn saved-register"
                          onClick={() => window.open(cheapest.url(domain), '_blank')}
                          title={`Register at ${cheapest.name}`}
                        >
                          Register →
                        </button>
                      )}
                      <button
                        className="saved-item-btn saved-unsave"
                        onClick={() => onUnsave(domain)}
                        title="Remove from saved"
                      >
                        <BookmarkIcon filled />
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
function BookmarkIcon({ filled }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
