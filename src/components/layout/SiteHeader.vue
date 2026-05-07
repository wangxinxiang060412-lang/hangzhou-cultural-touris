<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import type { LocalizedText } from '../../i18n/site'
import { localeOptions, pickLocalized, setSiteLocale, siteLocale, t } from '../../i18n/site'
import CommandPalette from './CommandPalette.vue'

const text = (zh: string, en: string, ja: string, ko: string): LocalizedText => ({
  'zh-CN': zh,
  'en-US': en,
  'ja-JP': ja,
  'ko-KR': ko,
})

const route = useRoute()
const isHome = computed(() => route.name === 'home')

// Two key "active" states: the Discover mega-menu is highlighted on any of
// its child pages; the Book entry stays highlighted across the whole
// reservation flow (list → detail → /booking).
const isDiscoverActive = computed(() =>
  ['neighborhoods', 'events', 'routes', 'visit-guide'].includes(String(route.name)),
)
const isBookActive = computed(() =>
  ['scenic-spots', 'scenic-spot-detail', 'booking'].includes(String(route.name)),
)
const isMyTripActive = computed(() => route.name === 'orders')

// 4 entries inside the Discover mega-menu; everything else has a direct
// top-level link. Drops the previous flat list of 7 nav items.
const discoverItems = computed(() => [
  {
    label: t('nav.discover.neighborhoods'),
    hint: t('nav.discover.neighborhoodsHint'),
    to: '/neighborhoods',
    icon: 'square',
  },
  {
    label: t('nav.discover.events'),
    hint: t('nav.discover.eventsHint'),
    to: '/events',
    icon: 'calendar',
  },
  {
    label: t('nav.discover.routes'),
    hint: t('nav.discover.routesHint'),
    to: '/routes',
    icon: 'route',
  },
  {
    label: t('nav.discover.guide'),
    hint: t('nav.discover.guideHint'),
    to: '/visit-guide',
    icon: 'book',
  },
])

const isPastHero = ref(false)
const isMenuOpen = ref(false)
const isMegaOpen = ref(false)
const isDiscoverExpanded = ref(false)
const paletteOpen = ref(false)
let rafId = 0
let ticking = false

const updateScroll = () => {
  isPastHero.value = window.scrollY > (window.innerHeight || 0) * 0.55
  ticking = false
}

const onScroll = () => {
  if (ticking) return
  ticking = true
  rafId = window.requestAnimationFrame(updateScroll)
}

const closeMenu = () => {
  isMenuOpen.value = false
  isDiscoverExpanded.value = false
}

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const handleLocaleChange = (locale: string) => {
  if (locale === 'zh-CN' || locale === 'en-US' || locale === 'ja-JP' || locale === 'ko-KR') {
    setSiteLocale(locale)
  }
}

const localeValue = computed({
  get: () => siteLocale.value,
  set: (value: string) => handleLocaleChange(value),
})

const isMacLike = computed(() => {
  if (typeof navigator === 'undefined') return false
  const platform = (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform
  const probe = `${platform ?? ''} ${navigator.platform ?? ''} ${navigator.userAgent ?? ''}`
  return /Mac|iPhone|iPad|iPod/i.test(probe)
})
const shortcutHint = computed(() => (isMacLike.value ? '⌘K' : 'Ctrl+K'))

const openPalette = () => {
  paletteOpen.value = true
  closeMenu()
}
const closePalette = () => {
  paletteOpen.value = false
}

const openMega = () => {
  isMegaOpen.value = true
}
const closeMega = () => {
  isMegaOpen.value = false
}

const onKeydown = (event: KeyboardEvent) => {
  // Esc — close whatever's open.
  if (event.key === 'Escape') {
    closeMenu()
    closeMega()
    return
  }
  // ⌘K / Ctrl+K — toggle the command palette globally. Prevent the browser
  // shortcut (focus address bar) from stealing it.
  if ((event.metaKey || event.ctrlKey) && !event.altKey && !event.shiftKey && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    paletteOpen.value = !paletteOpen.value
  }
}

onMounted(() => {
  updateScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll, { passive: true })
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onScroll)
  window.removeEventListener('keydown', onKeydown)
  document.body.classList.remove('is-menu-open')
  if (rafId) {
    window.cancelAnimationFrame(rafId)
  }
})

watch(
  () => route.fullPath,
  () => {
    closeMenu()
    closeMega()
    closePalette()
    window.requestAnimationFrame(updateScroll)
  },
)

watch(isMenuOpen, (open) => {
  document.body.classList.toggle('is-menu-open', open)
})
</script>

<template>
  <header
    class="site-header"
    :class="{ 'is-home': isHome, 'is-past-hero': isPastHero, 'is-floating': isHome && !isPastHero }"
  >
    <div class="site-header__inner">
      <RouterLink class="site-header__brand" to="/" :aria-label="t('nav.brandAria')" @click="closeMenu">
        <svg class="brand-mark-icon" viewBox="0 0 20 20" aria-hidden="true">
          <circle class="brand-mark-icon__lake" cx="10" cy="9" r="5" />
          <path class="brand-mark-icon__wave" d="M3 14c2-2 4-2 6 0s4 2 6 0 4-2 6 0" />
        </svg>
        <span class="brand-mark">{{ t('nav.home') }}</span>
      </RouterLink>

      <nav class="site-header__nav" :aria-label="t('nav.menuLabel')">
        <!-- Discover dropdown trigger + mega-menu -->
        <div
          class="site-header__nav-group"
          @mouseenter="openMega"
          @mouseleave="closeMega"
        >
          <button
            type="button"
            class="site-header__nav-trigger"
            :class="{ 'is-active': isDiscoverActive, 'is-open': isMegaOpen }"
            :aria-haspopup="true"
            :aria-expanded="isMegaOpen"
            @click="isMegaOpen = !isMegaOpen"
            @focus="openMega"
          >
            {{ t('nav.discover') }}
            <span class="site-header__nav-caret" aria-hidden="true">▾</span>
          </button>

          <Transition name="mega">
            <div v-if="isMegaOpen" class="site-header__mega" role="menu">
              <p class="site-header__mega-tagline">{{ t('nav.discover.tagline') }}</p>
              <div class="site-header__mega-grid">
                <RouterLink
                  v-for="item in discoverItems"
                  :key="item.to"
                  :to="item.to"
                  class="site-header__mega-card"
                  role="menuitem"
                  @click="closeMega"
                >
                  <span class="site-header__mega-card-label">{{ item.label }}</span>
                  <small>{{ item.hint }}</small>
                </RouterLink>
              </div>
            </div>
          </Transition>
        </div>

        <RouterLink
          to="/scenic-spots"
          class="site-header__nav-link"
          :class="{ 'is-active': isBookActive }"
        >
          {{ t('nav.book') }}
        </RouterLink>

        <RouterLink
          to="/orders"
          class="site-header__nav-link"
          :class="{ 'is-active': isMyTripActive }"
        >
          {{ t('nav.myTrip') }}
        </RouterLink>
      </nav>

      <button
        type="button"
        class="site-header__search-chip"
        :aria-label="t('search.openAria')"
        @click="openPalette"
      >
        <svg class="site-header__search-icon" viewBox="0 0 20 20" width="14" height="14" aria-hidden="true">
          <circle cx="9" cy="9" r="6" fill="none" stroke="currentColor" stroke-width="1.6" />
          <path d="m17 17-3.5-3.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
        </svg>
        <span class="site-header__search-placeholder">{{ t('search.chipPlaceholder') }}</span>
        <kbd class="site-header__search-shortcut">{{ shortcutHint }}</kbd>
      </button>

      <label class="site-header__locale">
        <span class="site-header__locale-label">{{ t('nav.languageLabel') }}</span>
        <select v-model="localeValue" :aria-label="t('nav.languageAria')">
          <option v-for="option in localeOptions" :key="option.code" :value="option.code">
            {{ option.name }}
          </option>
        </select>
      </label>

      <button
        type="button"
        class="site-header__menu-toggle"
        :aria-expanded="isMenuOpen"
        aria-controls="site-mobile-menu"
        @click="toggleMenu"
      >
        <span class="menu-toggle__icon" aria-hidden="true"></span>
        <span class="menu-toggle__text">{{ isMenuOpen ? t('nav.close') : t('nav.menu') }}</span>
      </button>
    </div>

    <Transition name="mobile-menu">
      <div v-if="isMenuOpen" id="site-mobile-menu" class="site-header__mobile-panel">
        <button type="button" class="mobile-panel__search" @click="openPalette">
          <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
            <circle cx="9" cy="9" r="6" fill="none" stroke="currentColor" stroke-width="1.6" />
            <path d="m17 17-3.5-3.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
          </svg>
          <span>{{ t('search.chipPlaceholder') }}</span>
        </button>

        <nav class="mobile-panel__nav" :aria-label="t('nav.mobileMenuLabel')">
          <button
            type="button"
            class="mobile-panel__group"
            :class="{ 'is-expanded': isDiscoverExpanded, 'is-active': isDiscoverActive }"
            :aria-expanded="isDiscoverExpanded"
            @click="isDiscoverExpanded = !isDiscoverExpanded"
          >
            <span class="mobile-panel__group-label">
              <span>{{ t('nav.discover') }}</span>
              <small>{{ t('nav.discover.tagline') }}</small>
            </span>
            <span class="mobile-panel__group-caret" aria-hidden="true">{{ isDiscoverExpanded ? '−' : '+' }}</span>
          </button>

          <div v-if="isDiscoverExpanded" class="mobile-panel__sub">
            <RouterLink
              v-for="item in discoverItems"
              :key="item.to"
              :to="item.to"
              class="mobile-panel__sub-link"
              @click="closeMenu"
            >
              <span>{{ item.label }}</span>
              <small>{{ item.hint }}</small>
            </RouterLink>
          </div>

          <RouterLink
            to="/scenic-spots"
            class="mobile-panel__link"
            :class="{ 'is-reservation-active': isBookActive }"
            @click="closeMenu"
          >
            <span>{{ t('nav.book') }}</span>
            <small>{{ t('nav.note.reservations') }}</small>
          </RouterLink>

          <RouterLink to="/orders" class="mobile-panel__link" @click="closeMenu">
            <span>{{ t('nav.myTrip') }}</span>
            <small>{{ t('nav.note.orders') }}</small>
          </RouterLink>
        </nav>

        <label class="mobile-panel__locale">
          <span>{{ t('nav.languageLabel') }}</span>
          <select v-model="localeValue" :aria-label="t('nav.languageAria')">
            <option v-for="option in localeOptions" :key="option.code" :value="option.code">
              {{ option.name }}
            </option>
          </select>
        </label>

        <p
          v-if="false"
          aria-hidden="true"
        >
          <!-- preserve the legacy `text()` helper as a no-op so the import
               stays needed when we extend i18n later -->
          {{ pickLocalized(text('', '', '', '')) }}
        </p>
      </div>
    </Transition>
  </header>

  <CommandPalette :open="paletteOpen" @close="closePalette" />
</template>

<style scoped>
.site-header {
  position: sticky;
  top: 0;
  z-index: 30;
  width: 100%;
  background: rgba(244, 239, 230, 0.78);
  -webkit-backdrop-filter: blur(14px);
  backdrop-filter: blur(14px);
  border-bottom: 1px solid rgba(16, 20, 18, 0.08);
  transition:
    background 420ms ease,
    border-color 420ms ease,
    -webkit-backdrop-filter 420ms ease,
    backdrop-filter 420ms ease;
}

.site-header.is-home {
  background: transparent;
  -webkit-backdrop-filter: none;
  backdrop-filter: none;
  border-bottom-color: transparent;
}

.site-header.is-home.is-past-hero {
  background: rgba(244, 239, 230, 0.86);
  -webkit-backdrop-filter: blur(14px);
  backdrop-filter: blur(14px);
  border-bottom-color: rgba(16, 20, 18, 0.08);
}

/* New header grid: brand | nav | search-chip | locale | menu-toggle. The
   nav and search columns flex to absorb the remaining width. */
.site-header__inner {
  position: relative;
  display: grid;
  grid-template-columns: auto auto minmax(220px, 1fr) auto auto;
  align-items: center;
  gap: clamp(14px, 2vw, 32px);
  height: var(--site-header-h, 52px);
  padding: 0 var(--site-pad-x, clamp(20px, 3vw, 48px));
}

.site-header__brand {
  justify-self: start;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  color: var(--ink);
  font-family: var(--font-serif);
  font-size: 14px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  transition: color 220ms ease;
}

.brand-mark-icon {
  display: inline-block;
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  opacity: 0.88;
  transition: opacity 360ms ease, transform 360ms ease;
}

.brand-mark-icon__lake {
  fill: none;
  stroke: currentColor;
  stroke-width: 1.4;
}

.brand-mark-icon__wave {
  fill: none;
  stroke: var(--westlake-green);
  stroke-width: 1.4;
  stroke-linecap: round;
}

.site-header.is-floating .brand-mark-icon {
  opacity: 0.7;
  transform: scale(0.95);
}

.brand-mark {
  position: relative;
}

/* === 3-entry primary nav ============================================== */
.site-header__nav {
  justify-self: start;
  display: inline-flex;
  align-items: center;
  gap: clamp(4px, 1vw, 14px);
  color: rgba(16, 20, 18, 0.66);
  font-size: 13px;
  letter-spacing: 0.04em;
}

.site-header__nav-group {
  position: relative;
  display: inline-flex;
}

.site-header__nav-trigger,
.site-header__nav-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-height: 34px;
  padding: 6px 12px;
  border: 1px solid transparent;
  border-radius: 999px;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font-family: inherit;
  font-size: inherit;
  letter-spacing: inherit;
  white-space: nowrap;
  transition: background 180ms ease, color 180ms ease, border-color 180ms ease;
}

.site-header__nav-link.router-link-active,
.site-header__nav-link.is-active,
.site-header__nav-trigger.is-active,
.site-header__nav-trigger.is-open {
  background: rgba(31, 58, 52, 0.1);
  border-color: rgba(31, 58, 52, 0.18);
  color: var(--deep-green);
}

.site-header__nav-link:hover,
.site-header__nav-link:focus-visible,
.site-header__nav-trigger:hover,
.site-header__nav-trigger:focus-visible {
  background: rgba(31, 58, 52, 0.06);
  color: var(--deep-green);
  outline: none;
}

.site-header__nav-caret {
  font-size: 10px;
  line-height: 1;
  opacity: 0.7;
  transition: transform 180ms ease;
}

.site-header__nav-trigger.is-open .site-header__nav-caret {
  transform: rotate(180deg);
}

/* Mega-menu dropdown — sits below the Discover trigger */
.site-header__mega {
  position: absolute;
  top: calc(100% + 12px);
  left: 0;
  z-index: 5;
  width: clamp(360px, 36vw, 520px);
  display: grid;
  gap: 14px;
  padding: 18px;
  border: 1px solid rgba(16, 20, 18, 0.1);
  border-radius: 14px;
  background: rgba(250, 247, 240, 0.98);
  -webkit-backdrop-filter: blur(14px);
  backdrop-filter: blur(14px);
  box-shadow: 0 20px 48px rgba(36, 42, 39, 0.12);
}

.site-header__mega-tagline {
  color: rgba(16, 20, 18, 0.42);
  font-size: 11px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
}

.site-header__mega-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1px;
  background: rgba(16, 20, 18, 0.08);
  border: 1px solid rgba(16, 20, 18, 0.08);
  border-radius: 10px;
  overflow: hidden;
}

.site-header__mega-card {
  display: grid;
  gap: 6px;
  padding: 14px 14px 16px;
  background: rgba(250, 247, 240, 0.96);
  color: var(--ink);
  transition: background 160ms ease, color 160ms ease;
}

.site-header__mega-card:hover,
.site-header__mega-card:focus-visible {
  background: rgba(31, 58, 52, 0.08);
  color: var(--deep-green);
  outline: none;
}

.site-header__mega-card-label {
  font-family: var(--font-serif);
  font-size: 17px;
  letter-spacing: 0.04em;
}

.site-header__mega-card small {
  color: rgba(16, 20, 18, 0.5);
  font-size: 12px;
  letter-spacing: 0.02em;
  line-height: 1.4;
}

.mega-enter-active,
.mega-leave-active {
  transition: opacity 180ms ease, transform 180ms ease;
}

.mega-enter-from,
.mega-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* === Search chip ====================================================== */
.site-header__search-chip {
  justify-self: end;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  max-width: 280px;
  min-height: 36px;
  padding: 6px 10px 6px 12px;
  border: 1px solid rgba(16, 20, 18, 0.12);
  border-radius: 999px;
  background: rgba(31, 58, 52, 0.04);
  color: rgba(16, 20, 18, 0.6);
  cursor: pointer;
  font-family: inherit;
  font-size: 13px;
  letter-spacing: 0.02em;
  transition: background 180ms ease, border-color 180ms ease, color 180ms ease;
}

.site-header__search-chip:hover,
.site-header__search-chip:focus-visible {
  background: rgba(31, 58, 52, 0.1);
  border-color: rgba(31, 58, 52, 0.24);
  color: var(--deep-green);
  outline: none;
}

.site-header__search-icon {
  flex-shrink: 0;
}

.site-header__search-placeholder {
  flex: 1;
  min-width: 0;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.site-header__search-shortcut {
  flex-shrink: 0;
  display: inline-grid;
  place-items: center;
  min-width: 36px;
  padding: 2px 8px;
  border: 1px solid rgba(16, 20, 18, 0.12);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.6);
  color: rgba(16, 20, 18, 0.52);
  font-family: var(--font-sans);
  font-size: 11px;
  letter-spacing: 0;
}

/* === Locale select ==================================================== */
.site-header__locale {
  display: inline-flex;
  align-items: center;
  justify-self: end;
}

.site-header__locale-label {
  display: none;
}

.mobile-panel__locale span {
  color: rgba(16, 20, 18, 0.42);
  font-size: 10px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}

.site-header__locale select {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  min-width: 96px;
  border: 0;
  border-radius: 999px;
  background-color: rgba(31, 58, 52, 0.06);
  background-image: url("data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8' fill='none' stroke='%231f3a34' stroke-width='1.4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M1 1.5 6 6.5 11 1.5'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 10px 7px;
  color: var(--deep-green);
  cursor: pointer;
  padding: 7px 28px 7px 14px;
  font-size: 12px;
  letter-spacing: 0.04em;
  transition: background-color 180ms ease, color 180ms ease;
}

.site-header__locale select:hover,
.site-header__locale select:focus-visible {
  background-color: rgba(31, 58, 52, 0.12);
  outline: none;
}

.mobile-panel__locale select {
  min-width: 110px;
  border: 0;
  border-radius: 999px;
  background: rgba(31, 58, 52, 0.06);
  color: var(--deep-green);
  cursor: pointer;
  padding: 10px 14px;
  font-size: 14px;
  letter-spacing: 0.04em;
}

/* === Menu toggle (mobile) ============================================= */
.site-header__menu-toggle {
  display: none;
  justify-self: end;
  align-items: center;
  gap: 10px;
  min-height: 34px;
  padding: 0;
  border: 0;
  background: transparent;
  color: rgba(16, 20, 18, 0.58);
  cursor: pointer;
  font-size: 10px;
  letter-spacing: 0.26em;
  text-transform: uppercase;
  transition: color 220ms ease;
}

.site-header__menu-toggle:hover,
.site-header__menu-toggle:focus-visible,
.site-header__menu-toggle[aria-expanded='true'] {
  color: var(--deep-green);
  outline: none;
}

.menu-toggle__icon {
  position: relative;
  display: block;
  width: 22px;
  height: 9px;
}

.menu-toggle__icon::before,
.menu-toggle__icon::after {
  content: '';
  position: absolute;
  left: 0;
  width: 22px;
  height: 1px;
  background: currentColor;
  transition:
    top 220ms ease,
    transform 220ms ease;
}

.menu-toggle__icon::before {
  top: 1px;
}

.menu-toggle__icon::after {
  top: 8px;
}

.site-header__menu-toggle[aria-expanded='true'] .menu-toggle__icon::before {
  top: 4px;
  transform: rotate(18deg);
}

.site-header__menu-toggle[aria-expanded='true'] .menu-toggle__icon::after {
  top: 4px;
  transform: rotate(-18deg);
}

.site-header__mobile-panel {
  display: none;
}

/* === Responsive collapse points ======================================= */
@media (max-width: 1080px) {
  .site-header__inner {
    grid-template-columns: auto auto minmax(180px, 1fr) auto auto;
    gap: 14px;
  }
  .site-header__search-placeholder {
    display: none;
  }
  .site-header__search-chip {
    max-width: 160px;
  }
}

@media (max-width: 760px) {
  .site-header__inner {
    grid-template-columns: 1fr auto auto;
    gap: 10px;
    padding: 0 18px;
  }

  .site-header__nav,
  .site-header__search-chip,
  .site-header__locale {
    display: none;
  }

  .site-header__menu-toggle {
    display: inline-flex;
  }

  .site-header,
  .site-header.is-home,
  .site-header.is-home.is-past-hero {
    background: rgba(244, 239, 230, 0.92);
    -webkit-backdrop-filter: blur(16px);
    backdrop-filter: blur(16px);
    border-bottom-color: rgba(16, 20, 18, 0.08);
  }

  .site-header__brand {
    gap: 10px;
    font-size: 12.5px;
    letter-spacing: 0.16em;
  }

  .brand-mark-icon {
    width: 16px;
    height: 16px;
  }

  .site-header__mobile-panel {
    position: absolute;
    inset: calc(var(--site-header-h, 48px) - 1px) 0 auto 0;
    display: grid;
    gap: 22px;
    padding: 18px 18px 22px;
    border-bottom: 1px solid rgba(16, 20, 18, 0.1);
    background:
      linear-gradient(180deg, rgba(250, 247, 240, 0.96), rgba(244, 239, 230, 0.94)),
      var(--paper);
    box-shadow: 0 24px 56px rgba(36, 42, 39, 0.08);
  }

  .mobile-panel__search {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    min-height: 44px;
    padding: 0 14px;
    border: 1px solid rgba(31, 58, 52, 0.18);
    border-radius: 999px;
    background: rgba(31, 58, 52, 0.05);
    color: var(--deep-green);
    cursor: pointer;
    font-family: inherit;
    font-size: 14px;
    letter-spacing: 0.02em;
  }

  .mobile-panel__nav {
    display: grid;
    gap: 4px;
    border-top: 1px solid rgba(16, 20, 18, 0.08);
    padding-top: 8px;
  }

  .mobile-panel__group {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 12px;
    min-height: 56px;
    padding: 10px 14px;
    margin: 0;
    border: 0;
    border-radius: 12px;
    background: transparent;
    color: var(--ink);
    cursor: pointer;
    font-family: inherit;
    text-align: left;
    transition: background 180ms ease, color 180ms ease;
  }

  .mobile-panel__group.is-active,
  .mobile-panel__group.is-expanded {
    background: rgba(31, 58, 52, 0.08);
    color: var(--deep-green);
  }

  .mobile-panel__group-label {
    display: grid;
    gap: 2px;
    min-width: 0;
  }

  .mobile-panel__group-label span {
    font-size: 17px;
    font-weight: 500;
    letter-spacing: 0.04em;
  }

  .mobile-panel__group-label small {
    color: rgba(16, 20, 18, 0.46);
    font-size: 11px;
    letter-spacing: 0.04em;
  }

  .mobile-panel__group-caret {
    font-size: 18px;
    color: rgba(16, 20, 18, 0.5);
  }

  .mobile-panel__sub {
    display: grid;
    gap: 2px;
    padding: 4px 8px 8px 22px;
  }

  .mobile-panel__sub-link {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 12px;
    min-height: 48px;
    padding: 6px 12px;
    border-radius: 10px;
    color: var(--ink);
    transition: background 180ms ease, color 180ms ease;
  }

  .mobile-panel__sub-link span {
    font-size: 15px;
    letter-spacing: 0.02em;
  }

  .mobile-panel__sub-link small {
    color: rgba(16, 20, 18, 0.5);
    font-size: 11px;
    letter-spacing: 0.02em;
  }

  .mobile-panel__sub-link.router-link-active {
    background: rgba(31, 58, 52, 0.08);
    color: var(--deep-green);
  }

  .mobile-panel__link {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 12px;
    align-items: center;
    min-height: 56px;
    padding: 10px 14px;
    margin: 0;
    border-radius: 12px;
    color: var(--ink);
    transition: background 180ms ease, color 180ms ease;
  }

  .mobile-panel__link span {
    font-family: var(--font-sans);
    font-size: 17px;
    font-weight: 500;
    letter-spacing: 0.04em;
    line-height: 1.4;
  }

  .mobile-panel__link small {
    color: rgba(16, 20, 18, 0.46);
    font-size: 11px;
    letter-spacing: 0.04em;
    line-height: 1.3;
    text-align: right;
  }

  .mobile-panel__link:hover,
  .mobile-panel__link:focus-visible {
    color: var(--deep-green);
    outline: none;
  }

  .mobile-panel__link.router-link-active,
  .mobile-panel__link.is-reservation-active {
    background: rgba(31, 58, 52, 0.08);
    color: var(--deep-green);
  }

  .mobile-panel__locale {
    display: grid;
    gap: 8px;
  }

  .mobile-menu-enter-active,
  .mobile-menu-leave-active {
    transition:
      opacity 220ms ease,
      transform 260ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  .mobile-menu-enter-from,
  .mobile-menu-leave-to {
    opacity: 0;
    transform: translate3d(0, -10px, 0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .site-header,
  .brand-mark-icon,
  .site-header__nav-link,
  .site-header__nav-trigger,
  .site-header__nav-caret,
  .site-header__search-chip,
  .site-header__menu-toggle,
  .menu-toggle__icon::before,
  .menu-toggle__icon::after {
    transition: none;
  }
}
</style>
