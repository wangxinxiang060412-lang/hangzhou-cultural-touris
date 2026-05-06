import { watch } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteLocationNormalized, RouterScrollBehavior } from 'vue-router'

import Home from '../pages/Home.vue'
import { siteLocale, t } from '../i18n/site'

const Admin = () => import('../pages/Admin.vue')
const Booking = () => import('../pages/Booking.vue')
const NotFound = () => import('../pages/NotFound.vue')
const Orders = () => import('../pages/Orders.vue')
const Routes = () => import('../pages/Routes.vue')
const ScenicSpotDetail = () => import('../pages/ScenicSpotDetail.vue')
const ScenicSpots = () => import('../pages/ScenicSpots.vue')
const VisitGuide = () => import('../pages/VisitGuide.vue')

const scrollBehavior: RouterScrollBehavior = (to, _from, savedPosition) => {
  if (savedPosition) {
    return savedPosition
  }

  if (to.hash) {
    return {
      el: to.hash,
      top: 72,
      behavior: 'smooth',
    }
  }

  return { top: 0, behavior: 'smooth' }
}

const router = createRouter({
  history: createWebHistory(),
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
