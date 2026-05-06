/**
 * Smoothly scrolls to an in-page anchor (without changing the route hash),
 * accounting for the sticky site header height.
 *
 * Pass either `#id` or `id` — both are accepted. Returns true when the target
 * exists, false otherwise.
 */
export const scrollToAnchor = (target: string): boolean => {
  if (typeof document === 'undefined') return false

  const id = target.startsWith('#') ? target.slice(1) : target
  const element = document.getElementById(id)

  if (!element) return false

  element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  element.setAttribute('tabindex', '-1')

  window.setTimeout(() => {
    element.focus({ preventScroll: true })
  }, 420)

  return true
}
