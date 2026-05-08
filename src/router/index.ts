import { watch } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteLocationNormalized, RouterScrollBehavior } from 'vue-router'

import Home from '../pages/Home.vue'
import { siteLocale, t } from '../i18n/site'
import { getHeaderOffset } from '../utils/scroll'

const Admin = () => import('../pages/Admin.vue')
const Booking = () => import('../pages/Booking.vue')
const CityPasses = () => import('../pages/CityPasses.vue')
const EventsCalendar = () => import('../pages/EventsCalendar.vue')
const Neighborhoods = () => import('../pages/Neighborhoods.vue')
const NotFound = () => import('../pages/NotFound.vue')
const Orders = () => import('../pages/Orders.vue')
const Routes = () => import('../pages/Routes.vue')
const ScenicSpotDetail = () => import('../pages/ScenicSpotDetail.vue')
const ScenicSpots = () => import('../pages/ScenicSpots.vue')
const VisitGuide = () => import('../pages/VisitGuide.vue')

const waitForLayout = () =>
  new Promise<void>((resolve) => {
    if (typeof window === 'undefined') return resolve()
    // Two rAFs ≈ one paint after the new view is mounted; gives async data
    // (catalog, orders, slots…) a chance to fill the page so the saved
    // scroll position is no longer clamped to a near-empty document.
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => resolve())
    })
  })

const scrollBehavior: RouterScrollBehavior = async (to, from, savedPosition) => {
  // Browser back / forward — restore exactly where the user left off, but
  // wait for the new page's DOM to settle first so the document is tall
  // enough for the saved scrollY to land correctly.
  if (savedPosition) {
    await waitForLayout()
    return savedPosition
  }

  // Anchor jump within / across pages — keep a smooth scroll for hashes,
  // but compensate the sticky header height once.
  if (to.hash) {
    return {
      el: to.hash,
      top: getHeaderOffset(),
      behavior: 'smooth',
    }
  }

  // Re-clicking the link of the page you're already on — silently snap to
  // the top so the click never feels dead.
  if (from && to.path === from.path && to.hash === from.hash) {
    return { top: 0, left: 0 }
  }

  // Fresh navigation between pages — instant jump to the top, the way every
  // standard website behaves. No more "smooth-scroll back to the top, then
  // swap pages" wobble.
  return { top: 0, left: 0 }
}

const router = createRouter({
  history: createWebHashHistory(),
  scrollBehavior,
  routes: [
    { path: '/', name: 'home', component: Home, meta: { titleKey: 'page.home' } },
    { path: '/about', redirect: '/visit-guide' },
    { path: '/routes', name: 'routes', component: Routes, meta: { titleKey: 'nav.routes' } },
    {
      // Backwards compatibility for any old "/archive" URL: send the visitor to
      // the spot list instead of 404.
      path: '/archive',
      redirect: '/scenic-spots',
    },
    {
      path: '/scenic-spots',
      name: 'scenic-spots',
      component: ScenicSpots,
      meta: { titleKey: 'scenic.title' },
    },
    {
      path: '/scenic-spots/:id',
      name: 'scenic-spot-detail',
      component: ScenicSpotDetail,
      meta: { titleKey: 'scenic.title' },
    },
    {
      path: '/city-passes',
      name: 'city-passes',
      component: CityPasses,
      meta: { titleKey: 'page.cityPasses' },
    },
    {
      path: '/neighborhoods',
      name: 'neighborhoods',
      component: Neighborhoods,
      meta: { titleKey: 'page.neighborhoods' },
    },
    {
      path: '/events',
      name: 'events',
      component: EventsCalendar,
      meta: { titleKey: 'page.events' },
    },
    {
      path: '/booking',
      name: 'booking',
      component: Booking,
      meta: { titleKey: 'booking.title' },
    },
    { path: '/orders', name: 'orders', component: Orders, meta: { titleKey: 'orders.title' } },
    {
      path: '/visit-guide',
      name: 'visit-guide',
      component: VisitGuide,
      meta: { titleKey: 'page.visitGuide' },
    },
    { path: '/admin', name: 'admin', component: Admin, meta: { titleKey: 'admin.title' } },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFound,
      meta: { titleKey: 'notfound.title' },
    },
  ],
})

const SUFFIX_BY_LOCALE: Record<string, string> = {
  'zh-CN': '杭州文旅',
  'en-US': 'Hangzhou Travel',
  'ja-JP': '杭州文旅',
  'ko-KR': '항저우 문화관광',
}

const updateDocumentTitle = (to: RouteLocationNormalized) => {
  if (typeof document === 'undefined') return
  const titleKey = (to.meta as { titleKey?: string }).titleKey
  const suffix = SUFFIX_BY_LOCALE[siteLocale.value] ?? SUFFIX_BY_LOCALE['zh-CN']
  if (titleKey) {
    const head = t(titleKey)
    document.title = head ? `${head} · ${suffix}` : suffix
  } else {
    document.title = suffix
  }
}

router.afterEach((to) => {
  updateDocumentTitle(to)
})

// Re-translate the document title when the user switches language.
watch(siteLocale, () => {
  updateDocumentTitle(router.currentRoute.value)
})

export default router
