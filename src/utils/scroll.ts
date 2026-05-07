export const getHeaderOffset = () => {
  if (typeof document === 'undefined') return 64

  const raw = getComputedStyle(document.documentElement).getPropertyValue('--site-header-h').trim()
  const parsed = Number.parseFloat(raw)
  return Number.isFinite(parsed) ? parsed + 12 : 64
}

/**
 * Smoothly scrolls to an in-page anchor (without changing the route hash),
 * accounting for the sticky site header height.
 *
 * Pass either `#id` or `id` — both are accepted. Returns true when the target
 * exists, false otherwise.
 */
export const scrollToAnchor = (target: string): boolean => {
  if (typeof document === 'undefined' || typeof window === 'undefined') return false

  const id = target.startsWith('#') ? target.slice(1) : target
  const element = document.getElementById(id)

  if (!element) return false

  const top = window.scrollY + element.getBoundingClientRect().top - getHeaderOffset()
  window.scrollTo({ top, behavior: 'smooth' })
  element.setAttribute('tabindex', '-1')

  window.setTimeout(() => {
    element.focus({ preventScroll: true })
  }, 420)

  return true
}
