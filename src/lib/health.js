/**
 * src/lib/health.js
 * Client-side utilities for Domain Health Snapshot data.
 */

/**
 * Compute a privacy score (0–100) from a health snapshot.
 * Higher = more private / less infrastructure exposed.
 */
export function computePrivacyScore(health) {
  if (!health) return 0
  let score = 0
  if (health.status?.privacy_protected === true)      score += 40
  if (health.status?.website === 'inactive')          score += 30
  if (health.status?.email === 'not_configured')      score += 15
  if (!health.risk_flags?.includes('heavily_used'))   score += 15
  return score
}

/**
 * Derive a status tag from the health snapshot.
 * @returns {'clean'|'parked'|'active'|'suspicious'}
 */
export function computeStatusTag(health) {
  if (!health) return 'clean'
  const flags = health.risk_flags ?? []
  if (flags.includes('suspicious_dns'))  return 'suspicious'
  if (flags.includes('parked_domain'))   return 'parked'
  const { dns_present, mx_records } = health.signals ?? {}
  if (dns_present && mx_records)         return 'active'
  return 'clean'
}

/** Human-readable label for a status tag. */
export function healthSummaryLabel(tag) {
  switch (tag) {
    case 'clean':      return '🟢 Clean'
    case 'parked':     return '🟡 Parked'
    case 'active':     return '🔴 Active'
    case 'suspicious': return '⚠️ Suspicious'
    default:           return '🟢 Clean'
  }
}

/** CSS variable color for a status tag. */
export function healthTagColor(tag) {
  switch (tag) {
    case 'clean':      return 'var(--green)'
    case 'parked':     return 'var(--yellow)'
    case 'active':     return 'var(--red)'
    case 'suspicious': return 'var(--yellow)'
    default:           return 'var(--green)'
  }
}

/** CSS variable for a privacy score (green/yellow/red). */
export function privacyScoreColor(score) {
  if (score >= 75) return 'var(--green)'
  if (score >= 50) return 'var(--yellow)'
  return 'var(--red)'
}
