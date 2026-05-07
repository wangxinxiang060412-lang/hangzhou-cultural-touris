<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { localeOptions, setSiteLocale, siteLocale, t } from '../../i18n/site'

const route = useRoute()
const isHome = computed(() => route.name === 'home')
const isReservationRoute = computed(() =>
  ['scenic-spots', 'scenic-spot-detail', 'booking'].includes(String(route.name)),
)
const navItems = computed(() => [
  { label: t('nav.home'), to: '/', note: t('nav.note.home') },
  { label: t('nav.reservations'), to: '/scenic-spots', note: t('nav.note.reservations') },
  { label: t('nav.orders'), to: '/orders', note: t('nav.note.orders') },
  { label: t('nav.routes'), to: '/routes', note: t('nav.note.routes') },
  { label: t('page.visitGuide'), to: '/visit-guide', note: t('nav.note.visitGuide') },
])

const isPastHero = ref(false)
const isMenuOpen = ref(false)
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

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    closeMenu()
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

      <span class="site-header__sub" aria-hidden="true">Hangzhou Travel</span>

      <nav class="site-header__nav" :aria-label="t('nav.menuLabel')">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          :class="{ 'is-reservation-active': item.to === '/scenic-spots' && isReservationRoute }"
        >
          {{ item.label }}
        </RouterLink>
      </nav>

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
        <nav class="mobile-panel__nav" :aria-label="t('nav.mobileMenuLabel')">
          <RouterLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="mobile-panel__link"
            :class="{ 'is-reservation-active': item.to === '/scenic-spots' && isReservationRoute }"
            @click="closeMenu"
          >
            <span>{{ item.label }}</span>
            <small>{{ item.note }}</small>
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
      </div>
    </Transition>
  </header>
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

/* On the home page, the hero already carries its own archival bar; let the
   header read as a quiet, weightless layer above it and avoid duplicating the
   project mark. The bg fades in only after the user scrolls past the hero. */
.site-header.is-home {
  background: transparent;
  -webkit-backdrop-filter: none;
  backdrop-filter: none;
  border-bottom-color: transparent;
}

.site-header.is-home .site-header__inner {
  grid-template-columns: auto 1fr auto auto;
}

.site-header.is-home .site-header__sub {
  display: none;
}

.site-header.is-home.is-past-hero {
  background: rgba(244, 239, 230, 0.86);
  -webkit-backdrop-filter: blur(14px);
  backdrop-filter: blur(14px);
  border-bottom-color: rgba(16, 20, 18, 0.08);
}

.site-header__inner {
  position: relative;
  display: grid;
  grid-template-columns: auto auto 1fr auto auto;
  align-items: center;
  gap: 16px;
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

.site-header__sub {
  justify-self: center;
  color: rgba(16, 20, 18, 0.42);
  font-size: 11px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  white-space: nowrap;
}

.site-header__nav {
  justify-self: end;
  display: inline-flex;
  align-items: center;
  gap: clamp(16px, 2.4vw, 32px);
  color: rgba(16, 20, 18, 0.5);
  font-size: 11px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
}

.site-header__nav a {
  position: relative;
  padding-bottom: 2px;
  transition: color 220ms ease;
}

.site-header__nav a::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -2px;
  height: 1px;
  background: currentColor;
  transform: scaleX(0);
  transform-origin: left center;
  transition: transform 320ms ease;
}

.site-header__nav a:hover,
.site-header__nav a:focus-visible,
.site-header__nav a.router-link-active,
.site-header__nav a.is-reservation-active {
  color: var(--deep-green);
  outline: none;
}

.site-header__nav a.router-link-active::after,
.site-header__nav a.is-reservation-active::after,
.site-header__nav a:hover::after {
  transform: scaleX(1);
}

.site-header__locale {
  display: inline-flex;
  align-items: center;
  justify-self: end;
}

/* Hide the "Language" label on desktop — the capsule itself shows the
   currently selected language, an extra label above it just doubled the
   header height and read like a backend filter form. The label is still
   rendered (and visible) inside the mobile drawer where vertical room is
   plentiful. */
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

@media (max-width: 760px) {
  .site-header__sub {
    display: none;
  }

  .site-header__inner {
    grid-template-columns: 1fr auto auto;
  }
}

@media (max-width: 640px) {
  .site-header__inner {
    gap: 10px;
    padding: 0 18px;
  }

  .site-header__brand {
    gap: 10px;
    font-size: 12px;
    letter-spacing: 0.16em;
  }

  .brand-mark-icon {
    width: 16px;
    height: 16px;
  }

  .site-header__nav {
    gap: 14px;
    font-size: 10px;
    letter-spacing: 0.22em;
  }
}

@media (max-width: 720px) {
  .site-header,
  .site-header.is-home,
  .site-header.is-home.is-past-hero {
    background: rgba(244, 239, 230, 0.9);
    -webkit-backdrop-filter: blur(16px);
    backdrop-filter: blur(16px);
    border-bottom-color: rgba(16, 20, 18, 0.08);
  }

  .site-header__nav {
    display: none;
  }

  .site-header__locale {
    display: none;
  }

  .site-header__menu-toggle {
    display: inline-flex;
  }

  .site-header__mobile-panel {
    position: absolute;
    inset: calc(var(--site-header-h, 48px) - 1px) 0 auto 0;
    display: grid;
    gap: 28px;
    padding: 18px 18px 22px;
    border-bottom: 1px solid rgba(16, 20, 18, 0.1);
    background:
      linear-gradient(180deg, rgba(250, 247, 240, 0.96), rgba(244, 239, 230, 0.94)),
      var(--paper);
    box-shadow: 0 24px 56px rgba(36, 42, 39, 0.08);
  }

  .mobile-panel__nav {
    display: grid;
    border-top: 1px solid rgba(16, 20, 18, 0.08);
  }

  .mobile-panel__locale {
    display: grid;
    gap: 10px;
  }

  .mobile-panel__link {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 12px;
    align-items: center;
    min-height: 56px;
    padding: 10px 14px;
    margin: 0 -14px;
    border-bottom: 1px solid rgba(16, 20, 18, 0.08);
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
    letter-spacing: 0.16em;
    line-height: 1.3;
    text-align: right;
  }

  .mobile-panel__link:hover,
  .mobile-panel__link:focus-visible {
    color: var(--deep-green);
    outline: none;
  }

  .mobile-panel__link.router-link-active {
    background: rgba(31, 58, 52, 0.08);
    color: var(--deep-green);
    border-bottom-color: transparent;
  }

  .mobile-panel__link.router-link-active span {
    font-weight: 600;
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
  .site-header__nav a,
  .site-header__nav a::after,
  .site-header__menu-toggle,
  .menu-toggle__icon::before,
  .menu-toggle__icon::after {
    transition: none;
  }
}
</style>
