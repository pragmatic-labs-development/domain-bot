/**
 * src/components/DomainCard.jsx
 * Card used in the Basic tab for available/premium domains.
 */

import { useState, useEffect } from 'react'
import { getLowestPrice, seoScore, scoreColor, getRegistrarPrices } from '../lib/pricing'
import { computePrivacyScore, computeStatusTag, healthSummaryLabel } from '../lib/health'

export function DomainCard({ domain, result, livePrices = {}, healthData = {}, saved, isUnlocked: unlockedFromParent, onSave, onDetail, onLiveCheck, onLoadHealth }) {
  const [lockState,  setLockState]  = useState(() => unlockedFromParent ? 'unlocked' : 'locked')
  const [isSaved,    setIsSaved]    = useState(saved)
  const [bookmarkAnim, setBookmarkAnim] = useState(false)

  // Stay in sync if parent removes the save (e.g. from Saved panel)
  useEffect(() => { setIsSaved(saved) }, [saved])
  // Sync lock state when modal unlocks this domain
  useEffect(() => {
    if (unlockedFromParent && lockState === 'locked') setLockState('unlocked')
  }, [unlockedFromParent])
  const { status } = result
  const [name, ...tldParts] = domain.split('.')
  const tld = '.' + tldParts.join('.')

  const price    = getLowestPrice(domain, livePrices)
  const seo      = seoScore(domain)
  const seoClr   = scoreColor(seo, 'seo')

  // Dollar tier — always teal, count shows relative cost
  let dollarTier = 0
  if      (price <= 5)   dollarTier = 1
  else if (price <= 15)  dollarTier = 2
  else if (price <= 40)  dollarTier = 3
  else if (price < 9999) dollarTier = 4

  const isPremium  = status === 'premium'
  const isUnlocked = lockState === 'unlocked'

  // Auto-retry health if unlocked but data missing (e.g. previous fetch failed)
  useEffect(() => {
    if (isUnlocked && !healthData[domain]) onLoadHealth?.(domain)
  }, [isUnlocked, domain])

  // SEO quality label for unlocked state
  const seoLabel = seo >= 80 ? 'Strong' : seo >= 60 ? 'Good' : seo >= 40 ? 'Fair' : 'Weak'

  function handleSave() {
    const next = !isSaved
    setIsSaved(next)           // instant — no round-trip lag
    if (next) {
      setBookmarkAnim(true)
      setTimeout(() => setBookmarkAnim(false), 400)
    }
    onSave(domain)             // sync parent in background
  }

  return (
    <div
      className={[
        'domain-card',
        isPremium ? 'card-premium' : 'card-available',
        isSaved ? 'card-saved' : '',
        isUnlocked ? 'card-unlocked' : '',
      ].filter(Boolean).join(' ')}
      onClick={handleSave}
      style={{ cursor: 'pointer' }}
    >

      {/* ── Top row: domain name + bookmark pill ── */}
      <div className="card-header">
        <div className="card-name">
          <span className="card-keyword">{name}</span>
          <span className="card-tld">{tld}</span>
        </div>

        {/* Lightweight bookmark — barely visible until hover/saved */}
        <button
          className={`card-bookmark ${isSaved ? 'saved' : ''} ${bookmarkAnim ? 'bookmark-pop' : ''}`}
          onClick={e => { e.stopPropagation(); handleSave() }}
          title={isSaved ? 'Remove from saved' : 'Save domain'}
          aria-label={isSaved ? 'Remove from saved' : 'Save domain'}
        >
          <BookmarkIcon filled={isSaved} />
        </button>
      </div>

      {/* ── Live-data strip (only visible when unlocked) ── */}
      {isUnlocked && (() => {
        const health = healthData[domain]
        const tag    = health ? computeStatusTag(health) : null
        const score  = health ? computePrivacyScore(health) : null
        return (
          <div className="card-live-strip">
            <span className="card-live-dot" />
            <span className="card-live-label">Live data</span>
            {health ? (
              <span className="card-health-compact">
                <span className="card-health-tag">{healthSummaryLabel(tag)}</span>
                <span className="card-health-score">{score} priv</span>
              </span>
            ) : (
              <span className="card-health-skeleton" />
            )}
          </div>
        )
      })()}

      {/* ── Bottom row: price tier | SEO | detail | live-check ── */}
      <div className="card-bottom-row">
        {/* Estimated price — shown after live check */}
        {isUnlocked && (
          price < 9999
            ? <span className="card-est-price" title="Estimated price from historical registrar data">
                Starting at <strong>${price.toFixed(2)}</strong>
              </span>
            : <a
                className="card-check-registrar"
                href={`https://www.namecheap.com/domains/registration/results/?domain=${domain}`}
                target="_blank"
                rel="noreferrer"
                onClick={e => e.stopPropagation()}
              >
                Check registrar →
              </a>
        )}


        <div className="card-btns">
          {/* SEO badge — neutral when locked, teal when unlocked */}
          <div
            className={`card-seo-badge ${isUnlocked ? 'unlocked' : ''}`}
            title={`SEO Score: ${seo}/99`}
          >
            {seo}
          </div>

          {/* Detail / eye — full 44px touch target */}
          <button
            className="card-btn-detail"
            onClick={e => { e.stopPropagation(); onDetail?.(domain) }}
            title="View details"
            aria-label="View domain details"
          >
            <EyeIcon />
          </button>

          {/* Live-check / lock */}
          <button
            className={`card-btn-lock lock-${lockState}`}
            onClick={e => {
              e.stopPropagation()
              if (lockState !== 'locked') return
              setLockState('unlocking')
              setTimeout(() => setLockState('unlocked'), 500)
              onLiveCheck?.(domain)   // records unlock for modal state only
            }}
            disabled={lockState !== 'locked'}
            title={lockState === 'unlocked' ? 'Live data loaded' : 'Live check — fetch real-time pricing'}
            aria-label={lockState === 'unlocked' ? 'Live data loaded' : 'Run live price check'}
          >
            {lockState === 'locked' ? <LockIcon /> : <LockOpenIcon />}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Icons ── */

function BookmarkIcon({ filled }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
    </svg>
  )
}

function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  )
}

function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  )
}

function LockOpenIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2"/>
      <path d="M7 11V7a5 5 0 0 1 9.9-1"/>
    </svg>
  )
}
