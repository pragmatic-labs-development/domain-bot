/**
 * src/components/DomainRow.jsx
 * Row used in the Advanced tab — shows all domains with status, scores, actions.
 */

import { useState } from 'react'
import { getLowestPrice, seoScore, getRegistrarPrices } from '../lib/pricing'
// import { botScore } from '../lib/pricing'  // Bot score hidden for now
import { computePrivacyScore, computeStatusTag, healthSummaryLabel } from '../lib/health'

export function DomainRow({ domain, result, livePrices = {}, healthData = {}, saved, onSave, onLiveCheck, onDetail, index = 0 }) {
  const [isUnlocking, setIsUnlocking] = useState(false)
  const { status, tier } = result

  const isChecking    = status === 'checking'
  const isAvailable   = status === 'available'
  const isTaken       = status === 'taken'
  const isAftermarket = status === 'aftermarket'
  const isUnknown     = status === 'unknown'

  const [name, ...tldParts] = domain.split('.')
  const tld = '.' + tldParts.join('.')

  const seo      = seoScore(domain)
  // const bot      = botScore(domain, livePrices)
  const price    = getLowestPrice(domain, livePrices)
  const cheapest = isAvailable ? getRegistrarPrices(domain, livePrices)[0] : null

  const isVerified = tier === 'verified' || tier === 'godaddy'

  const statusColor = isAvailable   ? 'var(--green)'
    : isTaken       ? 'var(--red)'
    : isAftermarket ? 'var(--blue)'
    : isUnknown     ? 'var(--text-dim)'
    : 'var(--border)'

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
    <div
      className={`domain-row row-${isAftermarket ? 'aftermarket' : status} row-clickable`}
      style={{ '--row-accent': statusColor, animationDelay: `${index * 35}ms` }}
      onClick={() => onSave(domain)}
      role="button"
      tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onSave(domain) }}
    >
      <div className={`status-dot ${isVerified ? 'verified' : status}`} />

      <div className={`domain-label ${isTaken ? 'taken-label' : ''}`}>
        {name}<span className="domain-tld-muted">{tld}</span>
        {isVerified && <span className="data-tier-badge tier-live">Live</span>}
        {tier === 'dns' && <span className="data-tier-badge tier-dns">DNS</span>}
        {isVerified && healthData[domain] && (() => {
          const h     = healthData[domain]
          const tag   = computeStatusTag(h)
          const score = computePrivacyScore(h)
          return (
            <>
              <span className="data-tier-badge tier-health">{healthSummaryLabel(tag)}</span>
              <span className="data-tier-badge tier-privacy">{score} priv</span>
            </>
          )
        })()}
      </div>

      {isAvailable && cheapest && (
        <span className="row-starting-price">
          Starting at <strong>${cheapest.price.toFixed(2)}/yr</strong>
        </span>
      )}

      <div className="row-actions">
        <div
          className={`card-seo-badge ${isVerified ? 'unlocked' : ''}`}
          title={`SEO Score: ${seo}/99`}
        >
          {seo}
        </div>

        {/* Bookmark — always visible */}
        <button
          className={`card-icon-btn ${saved ? 'saved' : ''}`}
          onClick={e => { e.stopPropagation(); onSave(domain) }}
          title={saved ? 'Saved!' : 'Save domain'}
        >
          <BookmarkIcon filled={saved} />
        </button>

        {/* Lock / live check — always visible, disabled when verified or unlocking */}
        {!isAftermarket && (
          <button
            className={`row-action-btn row-lock-btn ${isVerified ? 'row-lock-verified' : ''} ${isUnlocking ? 'row-lock-unlocking' : ''}`}
            onClick={e => {
              e.stopPropagation()
              if (isVerified || isUnlocking) return
              setIsUnlocking(true)
              onLiveCheck(domain)?.finally(() => setIsUnlocking(false))
            }}
            title={isVerified ? 'Live data loaded' : isUnlocking ? 'Checking…' : 'Get authoritative availability + live price'}
            disabled={isVerified || isUnlocking}
          >
            {isVerified ? <LockOpenIcon /> : isUnlocking ? <RowSpinner /> : <LockIcon />}
          </button>
        )}

        {isTaken && (
          <button
            className="row-action-btn"
            onClick={e => { e.stopPropagation(); window.open(`https://who.is/whois/${domain}`, '_blank') }}
          >
            WHOIS
          </button>
        )}

        {isAftermarket && (
          <button
            className="row-action-btn"
            onClick={e => { e.stopPropagation(); window.open(`https://www.godaddy.com/domainsearch/find?domainToCheck=${domain}`, '_blank') }}
          >
            Make offer
          </button>
        )}

        {/* Eye / details button */}
        <button
          className="row-action-btn row-eye-btn"
          onClick={e => { e.stopPropagation(); onDetail?.(domain) }}
          title="View details"
          aria-label="View domain details"
        >
          <EyeIcon />
        </button>
      </div>
    </div>
  )
}



function BookmarkIcon({ filled }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
    </svg>
  )
}
function RowSpinner() {
  return <div className="dns-spinner" style={{ width: 9, height: 9, borderWidth: 1.5 }} />
}
function LockIcon() {
  return (
    <svg width="9" height="9" viewBox="0 0 12 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <rect x="1.5" y="6" width="9" height="7" rx="1.5"/>
      <path d="M3.5 6V4a2.5 2.5 0 015 0v2"/>
    </svg>
  )
}
function LockOpenIcon() {
  return (
    <svg width="9" height="9" viewBox="0 0 12 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <rect x="1.5" y="6" width="9" height="7" rx="1.5"/>
      <path d="M3.5 6V4a2.5 2.5 0 014.95-1"/>
    </svg>
  )
}
function EyeIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  )
}
