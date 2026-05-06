<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import SiteHeader from './components/layout/SiteHeader.vue'
import { siteLocale, t } from './i18n/site'
import { translateStaticDom } from './utils/domI18n'
import { scrollToAnchor } from './utils/scroll'

const route = useRoute()

let revealObserver: IntersectionObserver | null = null
let routeEffectsFrame = 0
let hashScrollTimer = 0
let staticTranslationFrame = 0

const isInInitialViewport = (node: HTMLElement) => {
  const rect = node.getBoundingClientRect()
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0
  return rect.top < viewportHeight * 0.96 && rect.bottom > 0
}

const setupReveals = async () => {
  await nextTick()

  revealObserver?.disconnect()
  revealObserver = null

  const revealNodes = Array.from(
    document.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-visible)'),
  )
  document.documentElement.classList.add('reveal-ready')

  if (!('IntersectionObserver' in window)) {
    revealNodes.forEach((node) => node.classList.add('is-visible'))
    return
  }

  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.classList.add('is-visible')
        revealObserver?.unobserve(entry.target)
      })
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.04 },
  )

  revealNodes.forEach((node) => {
    if (isInInitialViewport(node)) {
      node.classList.add('is-visible')
    } else {
      revealObserver?.observe(node)
    }
  })
}

const scrollToRouteHash = (attempt = 0) => {
  const hash = route.hash || window.location.hash
  if (!hash) return

  const id = hash.startsWith('#') ? hash.slice(1) : hash

  if (!document.getElementById(id)) {
    if (attempt >= 10) return
    window.clearTimeout(hashScrollTimer)
    hashScrollTimer = window.setTimeout(() => {
      scrollToRouteHash(attempt + 1)
    }, 80)
    return
  }

  scrollToAnchor(hash)
}

const runStaticTranslation = () => {
  if (siteLocale.value === 'zh-CN') return
  if (staticTranslationFrame) {
    window.cancelAnimationFrame(staticTranslationFrame)
  }
  staticTranslationFrame = window.requestAnimationFrame(() => {
    staticTranslationFrame = 0
    translateStaticDom()
  })
}

const runRouteEffects = () => {
  if (routeEffectsFrame) {
    window.cancelAnimationFrame(routeEffectsFrame)
  }
  routeEffectsFrame = window.requestAnimationFrame(() => {
    routeEffectsFrame = 0
    void setupReveals().then(() => {
      runStaticTranslation()
      scrollToRouteHash()
    })
  })
}

onMounted(() => {
  // Initial render — fire once immediately, again after the first paint to
  // catch components whose async children mount on the next tick.
  runRouteEffects()
  window.setTimeout(runRouteEffects, 80)
})

watch(siteLocale, () => {
  runStaticTranslation()
})

// Whenever the route changes, the new view is already in the DOM thanks to
// `flush: 'post'`. Re-running setupReveals here is what makes the new page
// actually appear (data-reveal nodes start at opacity 0 by default).
watch(
  () => route.fullPath,
  () => {
    runRouteEffects()
  },
  { flush: 'post' },
)

onBeforeUnmount(() => {
  revealObserver?.disconnect()
  revealObserver = null
  if (routeEffectsFrame) {
    window.cancelAnimationFrame(routeEffectsFrame)
  }
  if (staticTranslationFrame) {
    window.cancelAnimationFrame(staticTranslationFrame)
  }
  window.clearTimeout(hashScrollTimer)
})
</script>

<template>
  <a class="skip-link" href="#main-content">{{ t('common.skipToContent') }}</a>
  <SiteHeader />
  <router-view :key="route.fullPath" />
</template>
