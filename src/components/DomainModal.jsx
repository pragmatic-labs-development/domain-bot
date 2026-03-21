/**
 * src/components/DomainModal.jsx
 * Detailed popup view for a domain — quality scores, registrar pricing.
 */

import { useEffect } from 'react'
import { getRegistrarPrices, seoScore } from '../lib/pricing'

/* ── Score computation ── */
function computeScores(domain) {
  const [name, ...tldParts] = domain.split('.')
  const tld = tldParts.join('.')
  const kw  = name.toLowerCase()

  // Brandability — length, no hyphens/numbers, good vowel ratio
  let brand = 48
  if      (kw.length <= 4)  brand += 36
  else if (kw.length <= 6)  brand += 26
  else if (kw.length <= 8)  brand += 16
  else if (kw.length <= 10) brand += 6
  else if (kw.length > 13)  brand -= 10
  if (!/[-_]/.test(kw))     brand += 10
  if (!/[0-9]/.test(kw))    brand += 6
  const vowelRatio = (kw.match(/[aeiou]/g) || []).length / kw.length
  if (vowelRatio >= 0.2 && vowelRatio <= 0.6) brand += 5
  brand = Math.min(99, Math.max(12, brand))

  // SEO Strength — re-use existing hook
  const seo = seoScore(domain)

  // Memorability — similar but weights short + no numbers more
  let memo = 46
  if      (kw.length <= 4)  memo += 38
  else if (kw.length <= 6)  memo += 28
  else if (kw.length <= 8)  memo += 16
  else if (kw.length <= 10) memo += 6
  else if (kw.length > 12)  memo -= 12
  if (!/[0-9]/.test(kw)) memo += 10
  if (!/-/.test(kw))     memo += 6
  memo = Math.min(99, Math.max(12, memo))

  // TLD Quality
  const TLD_Q = {
    com: 95, net: 80, org: 75, io: 72, ai: 72, co: 68,
    app: 68, dev: 65, tech: 58, me: 60, us: 58, uk: 62,
    ca: 60, au: 58, shop: 55, store: 52, online: 48,
    site: 50, design: 60, studio: 58, agency: 60,
    media: 60, cloud: 62, digital: 58, software: 60,
    ly: 62, sh: 60, to: 58, gg: 65, so: 58,
    xyz: 42, info: 52, biz: 48, cc: 55, tv: 58,
    vc: 60, inc: 62, ltd: 60, pro: 65, run: 55,
    one: 58, live: 58, space: 52, team: 62, social: 58,
    fit: 52, pm: 50, fun: 48, lol: 42, wtf: 38,
  }
  const tldScore = TLD_Q[tld] ?? 45

  const avg = Math.round((brand + seo + memo + tldScore) / 4)
  return { brand, seo, memo, tldScore, avg }
}

function getGrade(avg) {
  if (avg >= 85) return { letter: 'A', color: 'var(--accent)',    title: 'Excellent domain',  desc: 'Strong across all quality metrics' }
  if (avg >= 72) return { letter: 'B', color: 'var(--green)',     title: 'Good domain',       desc: 'Solid choice with minor trade-offs' }
  if (avg >= 58) return { letter: 'C', color: 'var(--text)',      title: 'Average domain',    desc: 'Works well but has some limitations' }
  if (avg >= 44) return { letter: 'D', color: 'var(--text-muted)',title: 'Weak domain',       desc: 'Notable quality concerns' }
  return           { letter: 'F', color: 'var(--red)',       title: 'Poor domain',       desc: 'Not recommended for branding' }
}

function scoreBarColor(score) {
  if (score >= 80) return 'var(--accent)'
  if (score >= 60) return 'var(--text-muted)'
  if (score >= 44) return 'var(--text-dim)'
  return 'var(--red)'
}

/* ── Registrar badge colors ── */
const REGISTRAR_STYLES = {
  Spaceship:  { bg: '#4f46e5', initials: 'SS' },
  Hostinger:  { bg: '#7c3aed', initials: 'HO' },
  Namecheap:  { bg: '#dc2626', initials: 'NC' },
  Porkbun:    { bg: '#ea580c', initials: 'PB' },
  GoDaddy:    { bg: '#0284c7', initials: 'GD' },
}

/* ── Main component ── */
export function DomainModal({ domain, result, livePrices = {}, saved, onSave, onClose, onPrev, onNext, position }) {
  const status = result?.status ?? 'unknown'

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape')      onClose()
      if (e.key === 'ArrowLeft'  && onPrev) onPrev()
      if (e.key === 'ArrowRight' && onNext) onNext()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose, onPrev, onNext])

  const [name, ...tldParts] = domain.split('.')
  const tld = '.' + tldParts.join('.')

  const scores    = computeScores(domain)
  const grade     = getGrade(scores.avg)
  const registrars = getRegistrarPrices(domain, livePrices)
  const cheapest   = registrars[0]

  const isAvailable   = status === 'available'
  const isTaken       = status === 'taken'
  const isPremium     = status === 'premium'
  const isAftermarket = status === 'aftermarket'

  const statusLabel = isAvailable   ? 'Available'
    : isPremium     ? 'Premium'
    : isAftermarket ? 'Aftermarket'
    : isTaken       ? 'Taken'
    : 'Unknown'
  const statusClass = isAvailable   ? 'modal-status-available'
    : isPremium     ? 'modal-status-premium'
    : isTaken       ? 'modal-status-taken'
    : isAftermarket ? 'modal-status-aftermarket'
    : 'modal-status-unknown'

  return (
    <>
      <div className="modal-backdrop" onClick={onClose} />
      <div className="domain-modal" role="dialog" aria-modal="true">

        {/* Header */}
        <div className="modal-header">
          <div className="modal-title">
            <span className="modal-name">{name}</span>
            <span className="modal-tld">{tld}</span>
          </div>
          <div className="modal-header-actions">
            {position && <span className="modal-position">{position}</span>}
            <button
              className="modal-nav-btn"
              onClick={onPrev}
              disabled={!onPrev}
              aria-label="Previous domain"
              title="Previous (←)"
            >
              <ChevronLeftIcon />
            </button>
            <button
              className="modal-nav-btn"
              onClick={onNext}
              disabled={!onNext}
              aria-label="Next domain"
              title="Next (→)"
            >
              <ChevronRightIcon />
            </button>
            <button
              className={`modal-save-btn ${saved ? 'saved' : ''}`}
              onClick={() => onSave(domain)}
              title={saved ? 'Remove from saved' : 'Save domain'}
            >
              <BookmarkIcon filled={saved} />
            </button>
            <button className="modal-close-btn" onClick={onClose} aria-label="Close">
              <CloseIcon />
            </button>
          </div>
        </div>

        {/* Status badge */}
        <div className="modal-section modal-status-row">
          <span className={`modal-status-badge ${statusClass}`}>{statusLabel}</span>
        </div>

        {/* Domain Quality Score */}
        <div className="modal-section">
          <div className="modal-section-label">DOMAIN QUALITY SCORE</div>
          <div className="modal-grade-block">
            <div className="modal-grade-letter" style={{ color: grade.color }}>
              {grade.letter}
            </div>
            <div className="modal-grade-text">
              <div className="modal-grade-title">{grade.title}</div>
              <div className="modal-grade-desc">{grade.desc}</div>
            </div>
          </div>

          <div className="modal-score-bars">
            {[
              { label: 'Brandability',   score: scores.brand    },
              { label: 'SEO Strength',   score: scores.seo      },
              { label: 'Memorability',   score: scores.memo     },
              { label: 'TLD Quality',    score: scores.tldScore },
            ].map(({ label, score }) => (
              <div key={label} className="modal-score-row">
                <span className="modal-score-label">{label}</span>
                <div className="modal-score-track">
                  <div
                    className="modal-score-fill"
                    style={{ width: `${score}%`, background: scoreBarColor(score) }}
                  />
                </div>
                <span className="modal-score-num" style={{ color: scoreBarColor(score) }}>
                  {score}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Registrar pricing */}
        {(isAvailable || isPremium) && registrars.length > 0 && (
          <div className="modal-section">
            <div className="modal-section-label">REGISTER AT A REGISTRAR</div>
            <div className="modal-registrar-list">
              {registrars.map((r, i) => {
                const style = REGISTRAR_STYLES[r.name] ?? { bg: '#334155', initials: r.name.slice(0, 2).toUpperCase() }
                const isCheapest = i === 0
                return (
                  <button
                    key={r.name}
                    className="modal-registrar-row"
                    onClick={() => window.open(r.url(domain), '_blank')}
                  >
                    <div className="modal-reg-badge" style={{ background: style.bg }}>
                      {style.initials}
                    </div>
                    <span className="modal-reg-name">{r.name}</span>
                    {isCheapest && <span className="modal-cheapest-tag">Cheapest</span>}
                    <div className="modal-reg-right">
                      <span className="modal-reg-price">
                        ${r.price.toFixed(2)}<span className="modal-reg-per">/yr</span>
                      </span>
                      <ArrowIcon />
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Taken / aftermarket actions */}
        {isTaken && (
          <div className="modal-section modal-action-section">
            <button
              className="modal-primary-action"
              onClick={() => window.open(`https://who.is/whois/${domain}`, '_blank')}
            >
              WHOIS Lookup →
            </button>
          </div>
        )}
        {isAftermarket && (
          <div className="modal-section modal-action-section">
            <button
              className="modal-primary-action"
              onClick={() => window.open(`https://www.godaddy.com/domainsearch/find?domainToCheck=${domain}`, '_blank')}
            >
              Make an Offer →
            </button>
          </div>
        )}

        {/* Data source */}
        <div className="modal-footer">
          <span className="modal-footer-label">DATA SOURCE</span>
          <span className="modal-footer-value">DNS-over-HTTPS · Cloudflare DoH · Prices from registrar APIs</span>
        </div>

      </div>
    </>
  )
}

function BookmarkIcon({ filled }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
    </svg>
  )
}
function ChevronLeftIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15 18-6-6 6-6"/>
    </svg>
  )
}
function ChevronRightIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6"/>
    </svg>
  )
}
function CloseIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M18 6 6 18M6 6l12 12"/>
    </svg>
  )
}
function ArrowIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <path d="M5 12h14M12 5l7 7-7 7"/>
    </svg>
  )
}
