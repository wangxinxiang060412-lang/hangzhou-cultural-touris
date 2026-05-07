<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import PageCrumbs from '../components/common/PageCrumbs.vue'
import SectionNav from '../components/common/SectionNav.vue'
import TicketRail from '../components/common/TicketRail.vue'
import SiteFooter from '../components/layout/SiteFooter.vue'
import { useSmartBack } from '../composables/useSmartBack'
import {
  accessibilityLabels,
  accessibilityStatusLabels,
  facilityStatusLabels,
  getAccessibilityGuide,
} from '../data/accessibilityGuides'
import { getPracticalVisitGuide, practicalGuideLabels } from '../data/practicalGuides'
import { getSpotImage, getSpotImagePosition } from '../data/spotImages'
import { ticketingRules } from '../data/visitGuide'
import { pickLocalized, pickLocalizedList, t } from '../i18n/site'
import { fetchBookingSlots, fetchTicketTypes } from '../services/api'
import type { ApiBookingSlot, ApiTicketType } from '../services/api'
import { ensureCatalog, findScenicSpot } from '../stores/catalog'
import { ensureOperationsFeed, getSpotOperationStatus, type OperationTone } from '../stores/operations'
import {
  addTripItem,
  ensureTravelerProfile,
  favoriteSpotIds,
  markSpotViewed,
  setSpotTravelStatus,
  toggleFavoriteSpot,
  visitedSpotIds,
  wishedSpotIds,
} from '../stores/traveler'
import { formatLocalDate } from '../utils/date'
import {
  localizeSpotAddress,
  localizeSpotArea,
  localizeSpotCategory,
  localizeSpotDescription,
  localizeSpotName,
  localizeSpotOpeningHours,
  localizeSpotTags,
  localizeTicketAudience,
  localizeTicketDescription,
  localizeTicketName,
} from '../utils/localization'

const route = useRoute()
const { goBack } = useSmartBack('/scenic-spots')
const slots = ref<ApiBookingSlot[]>([])
const tickets = ref<ApiTicketType[]>([])
const apiError = ref('')
const today = formatLocalDate(new Date())

const spot = computed(() => {
  const id = typeof route.params.id === 'string' ? route.params.id : ''
  return id ? findScenicSpot(id) : null
})

const heroImage = computed(() => (spot.value ? getSpotImage(spot.value.id) : null))
const operationStatus = computed(() => (spot.value ? getSpotOperationStatus(spot.value.id) : null))
const practicalGuide = computed(() => (spot.value ? getPracticalVisitGuide(spot.value.id) : null))
const accessibilityGuide = computed(() => (spot.value ? getAccessibilityGuide(spot.value.id) : null))

const practicalGuideItems = computed(() => {
  if (!practicalGuide.value) return []

  return [
    { id: 'duration', label: practicalGuideLabels.duration, type: 'text' as const, value: practicalGuide.value.duration },
    {
      id: 'best-arrival',
      label: practicalGuideLabels.bestArrival,
      type: 'text' as const,
      value: practicalGuide.value.bestArrival,
    },
    {
      id: 'peak-avoidance',
      label: practicalGuideLabels.peakAvoidance,
      type: 'text' as const,
      value: practicalGuide.value.peakAvoidance,
    },
    { id: 'best-for', label: practicalGuideLabels.bestFor, type: 'list' as const, value: practicalGuide.value.bestFor },
    {
      id: 'photo-spots',
      label: practicalGuideLabels.photoSpots,
      type: 'list' as const,
      value: practicalGuide.value.photoSpots,
    },
    {
      id: 'nearby-dining',
      label: practicalGuideLabels.nearbyDining,
      type: 'list' as const,
      value: practicalGuide.value.nearbyDining,
    },
    { id: 'restrooms', label: practicalGuideLabels.restrooms, type: 'text' as const, value: practicalGuide.value.restrooms },
    { id: 'storage', label: practicalGuideLabels.storage, type: 'text' as const, value: practicalGuide.value.storage },
    { id: 'rainy-plan', label: practicalGuideLabels.rainyPlan, type: 'text' as const, value: practicalGuide.value.rainyPlan },
    {
      id: 'language-service',
      label: practicalGuideLabels.languageService,
      type: 'text' as const,
      value: practicalGuide.value.languageService,
    },
  ]
})

const accessibilityFitItems = computed(() => {
  if (!accessibilityGuide.value) return []

  return [
    {
      id: 'wheelchair',
      label: accessibilityLabels.wheelchair,
      status: accessibilityGuide.value.wheelchair,
      statusLabel: accessibilityStatusLabels[accessibilityGuide.value.wheelchair],
    },
    {
      id: 'seniors',
      label: accessibilityLabels.seniors,
      status: accessibilityGuide.value.seniors,
      statusLabel: accessibilityStatusLabels[accessibilityGuide.value.seniors],
    },
    {
      id: 'stroller',
      label: accessibilityLabels.stroller,
      status: accessibilityGuide.value.stroller,
      statusLabel: accessibilityStatusLabels[accessibilityGuide.value.stroller],
    },
  ]
})

const accessibilityFacilityItems = computed(() => {
  if (!accessibilityGuide.value) return []

  return [
    {
      id: 'accessible-restroom',
      label: accessibilityLabels.accessibleRestroom,
      status: accessibilityGuide.value.accessibleRestroom,
      statusLabel: facilityStatusLabels[accessibilityGuide.value.accessibleRestroom],
    },
    {
      id: 'elevator',
      label: accessibilityLabels.elevator,
      status: accessibilityGuide.value.elevator,
      statusLabel: facilityStatusLabels[accessibilityGuide.value.elevator],
    },
    {
      id: 'ramp',
      label: accessibilityLabels.ramp,
      status: accessibilityGuide.value.ramp,
      statusLabel: facilityStatusLabels[accessibilityGuide.value.ramp],
    },
    {
      id: 'rest-area',
      label: accessibilityLabels.restArea,
      status: accessibilityGuide.value.restArea,
      statusLabel: facilityStatusLabels[accessibilityGuide.value.restArea],
    },
    {
      id: 'english-guide',
      label: accessibilityLabels.englishGuide,
      status: accessibilityGuide.value.englishGuide,
      statusLabel: facilityStatusLabels[accessibilityGuide.value.englishGuide],
    },
    {
      id: 'nursing-room',
      label: accessibilityLabels.nursingRoom,
      status: accessibilityGuide.value.nursingRoom,
      statusLabel: facilityStatusLabels[accessibilityGuide.value.nursingRoom],
    },
  ]
})

const toneClass = (tone: OperationTone) => `is-${tone}`
const accessibilityClass = (status: string) => `is-${status}`

/**
 * Sections for the sticky sub-navigation. Built reactively so it drops the
 * "无障碍 / 实用信息 / 运营" chips when those sections aren't rendered for
 * the current spot.
 */
const subNavItems = computed(() => {
  const items: Array<{ id: string; label: string }> = [
    { id: 'section-overview', label: t('detail.subnav.overview') },
    { id: 'section-tickets', label: t('detail.subnav.tickets') },
  ]
  if (practicalGuide.value) {
    items.push({ id: 'section-practical', label: t('detail.subnav.practical') })
  }
  if (accessibilityGuide.value) {
    items.push({ id: 'section-accessibility', label: t('detail.subnav.accessibility') })
  }
  // Operations + rules are merged conceptually under "Rules & Notices"
  items.push({ id: 'section-rules', label: t('detail.subnav.rules') })
  return items
})

const loadSpotData = async (spotId: string) => {
  try {
    apiError.value = ''
    const [nextSlots, nextTickets] = await Promise.all([
      fetchBookingSlots(spotId),
      fetchTicketTypes(spotId),
    ])
    slots.value = nextSlots.filter((slot) => slot.date >= today).slice(0, 9)
    tickets.value = nextTickets
  } catch (error) {
    slots.value = []
    tickets.value = []
    apiError.value = error instanceof Error ? error.message : t('detail.dataLoadError')
  }
}

watch(
  () => spot.value?.id,
  (spotId) => {
    if (!spotId) return
    void loadSpotData(spotId)
  },
  { immediate: true },
)

onMounted(() => {
  void ensureCatalog()
  void ensureOperationsFeed()
  void ensureTravelerProfile()
})

watch(
  () => spot.value?.id,
  (spotId) => {
    if (spotId) {
      markSpotViewed(spotId)
    }
  },
  { immediate: true },
)
</script>

<template>
  <div class="page-shell">
    <main id="main-content" class="detail-page" tabindex="-1">
      <template v-if="spot">
        <section id="section-overview" class="detail-hero" aria-labelledby="detail-title" data-reveal>
          <button type="button" class="detail-hero__back-chip" @click="goBack">
            <svg class="detail-hero__back-icon" viewBox="0 0 16 16" aria-hidden="true">
              <path
                d="M10 13 5 8l5-5"
                fill="none"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <span>{{ t('common.backToReservations') }}</span>
          </button>

          <PageCrumbs
            :items="[
              { label: t('page.home'), to: '/' },
              { label: t('scenic.title'), to: '/scenic-spots' },
              { label: localizeSpotName(spot) },
            ]"
          />

          <div class="detail-hero__meta">
            <span>{{ localizeSpotArea(spot) }}</span>
            <span>{{ localizeSpotCategory(spot) }}</span>
          </div>

          <div class="detail-hero__layout">
            <div class="detail-hero__copy">
              <p class="detail-hero__eyebrow">{{ t('detail.eyebrow') }}</p>
              <h1 id="detail-title">{{ localizeSpotName(spot) }}</h1>
              <p class="detail-hero__en">{{ spot.nameEn }}</p>
              <p class="detail-hero__description">{{ localizeSpotDescription(spot) }}</p>
              <div class="detail-hero__tags" :aria-label="t('detail.tagsAria')">
                <span v-for="tag in localizeSpotTags(spot)" :key="tag">{{ tag }}</span>
              </div>
              <div class="detail-hero__actions">
                <RouterLink class="detail-hero__action" :to="{ path: '/booking', query: { spot: spot.id } }">
                  {{ t('common.startReservation') }}
                </RouterLink>
                <button
                  type="button"
                  class="detail-hero__action detail-hero__action--muted"
                  @click="toggleFavoriteSpot(spot.id)"
                >
                  {{ favoriteSpotIds.includes(spot.id) ? pickLocalized({ 'zh-CN': '已收藏', 'en-US': 'Saved', 'ja-JP': '保存済み', 'ko-KR': '저장됨' }) : pickLocalized({ 'zh-CN': '收藏', 'en-US': 'Favorite', 'ja-JP': '保存', 'ko-KR': '저장' }) }}
                </button>
                <button
                  type="button"
                  class="detail-hero__action detail-hero__action--muted"
                  @click="setSpotTravelStatus(spot.id, wishedSpotIds.includes(spot.id) ? null : 'wish')"
                >
                  {{ wishedSpotIds.includes(spot.id) ? pickLocalized({ 'zh-CN': '已想去', 'en-US': 'On Wishlist', 'ja-JP': '行きたい済み', 'ko-KR': '가고 싶음 저장' }) : pickLocalized({ 'zh-CN': '想去', 'en-US': 'Want to Go', 'ja-JP': '行きたい', 'ko-KR': '가고 싶음' }) }}
                </button>
                <button
                  type="button"
                  class="detail-hero__action detail-hero__action--muted"
                  @click="setSpotTravelStatus(spot.id, visitedSpotIds.includes(spot.id) ? null : 'visited')"
                >
                  {{ visitedSpotIds.includes(spot.id) ? pickLocalized({ 'zh-CN': '已去过', 'en-US': 'Visited', 'ja-JP': '訪問済み', 'ko-KR': '다녀옴' }) : pickLocalized({ 'zh-CN': '已去', 'en-US': 'Mark Visited', 'ja-JP': '訪問済みにする', 'ko-KR': '다녀옴으로 표시' }) }}
                </button>
                <button
                  type="button"
                  class="detail-hero__action detail-hero__action--muted"
                  @click="addTripItem({ scenicSpotId: spot.id, note: localizeSpotName(spot) })"
                >
                  {{ pickLocalized({ 'zh-CN': '加入行程', 'en-US': 'Add to Trip', 'ja-JP': '旅程に追加', 'ko-KR': '일정에 추가' }) }}
                </button>
                <RouterLink class="detail-hero__action detail-hero__action--muted" to="/visit-guide">
                  {{ t('page.visitGuide') }}
                </RouterLink>
                <RouterLink class="detail-hero__action detail-hero__action--muted" to="/orders">
                  {{ t('page.orders') }}
                </RouterLink>
              </div>
            </div>

            <figure class="detail-hero__media">
              <img
                v-if="heroImage"
                :src="heroImage"
                :alt="localizeSpotName(spot)"
                :style="{ objectPosition: getSpotImagePosition(spot.id, 'detail') }"
              />
              <div v-else class="detail-hero__placeholder" aria-hidden="true">{{ spot.nameEn.slice(0, 2) }}</div>
            </figure>
          </div>
        </section>

        <SectionNav :items="subNavItems" />

        <div class="detail-body">
          <div class="detail-body__main">

        <section class="detail-info" :aria-label="t('detail.infoAria')" data-reveal>
          <dl>
            <div>
              <dt>{{ t('detail.field.address') }}</dt>
              <dd>{{ localizeSpotAddress(spot) }}</dd>
            </div>
            <div>
              <dt>{{ t('detail.field.openingHours') }}</dt>
              <dd>{{ localizeSpotOpeningHours(spot) }}</dd>
            </div>
            <div>
              <dt>{{ t('detail.field.reservation') }}</dt>
              <dd>{{ spot.reservationRequired ? t('detail.reservationRequired') : t('detail.reservationOpen') }}</dd>
            </div>
            <div>
              <dt>{{ t('detail.field.ticketing') }}</dt>
              <dd>{{ spot.paid ? t('detail.ticketPaid') : t('detail.ticketFree') }}</dd>
            </div>
          </dl>
        </section>

        <section
          v-if="practicalGuide"
          id="section-practical"
          class="detail-section detail-section--practical"
          aria-labelledby="detail-practical-title"
          data-reveal
        >
          <header class="detail-section__head">
            <p>{{ pickLocalized(practicalGuideLabels.sectionEyebrow) }}</p>
            <h2 id="detail-practical-title">{{ pickLocalized(practicalGuideLabels.sectionTitle) }}</h2>
          </header>

          <div class="detail-practical">
            <article v-for="item in practicalGuideItems" :key="item.id" class="detail-practical__card">
              <small>{{ pickLocalized(item.label) }}</small>
              <ul v-if="item.type === 'list'">
                <li v-for="entry in pickLocalizedList(item.value)" :key="entry">{{ entry }}</li>
              </ul>
              <p v-else>{{ pickLocalized(item.value) }}</p>
            </article>
          </div>
        </section>

        <section
          v-if="accessibilityGuide"
          id="section-accessibility"
          class="detail-section detail-section--accessibility"
          aria-labelledby="detail-accessibility-title"
          data-reveal
        >
          <header class="detail-section__head">
            <p>{{ pickLocalized(accessibilityLabels.sectionEyebrow) }}</p>
            <h2 id="detail-accessibility-title">{{ pickLocalized(accessibilityLabels.sectionTitle) }}</h2>
          </header>

          <div class="detail-accessibility">
            <article class="detail-accessibility__overview">
              <small>{{ pickLocalized(accessibilityLabels.overviewTitle) }}</small>
              <p>{{ pickLocalized(accessibilityGuide.overview) }}</p>
            </article>

            <div class="detail-accessibility__block">
              <small class="detail-accessibility__block-label">{{ pickLocalized(accessibilityLabels.groupTitle) }}</small>
              <div class="detail-accessibility__fit-grid">
                <article
                  v-for="item in accessibilityFitItems"
                  :key="item.id"
                  class="detail-accessibility__fit-card"
                  :class="accessibilityClass(item.status)"
                >
                  <small>{{ pickLocalized(item.label) }}</small>
                  <strong>{{ pickLocalized(item.statusLabel) }}</strong>
                </article>
              </div>
            </div>

            <div class="detail-accessibility__block">
              <small class="detail-accessibility__block-label">{{ pickLocalized(accessibilityLabels.facilityTitle) }}</small>
              <div class="detail-accessibility__facility-grid">
                <article
                  v-for="item in accessibilityFacilityItems"
                  :key="item.id"
                  class="detail-accessibility__facility-card"
                >
                  <small>{{ pickLocalized(item.label) }}</small>
                  <span :class="accessibilityClass(item.status)">{{ pickLocalized(item.statusLabel) }}</span>
                </article>
              </div>
            </div>
          </div>
        </section>

        <section class="detail-guidance" :aria-label="t('detail.guidanceAria')" data-reveal="soft">
          <p>{{ t('detail.guidance') }}</p>
          <RouterLink to="/visit-guide">{{ t('detail.gotoGuide') }}</RouterLink>
        </section>

        <section
          v-if="operationStatus"
          class="detail-section detail-section--operations"
          aria-labelledby="detail-operations-title"
          data-reveal
        >
          <header class="detail-section__head">
            <p>Live Operations</p>
            <h2 id="detail-operations-title">实时运行状态</h2>
          </header>

          <div class="detail-operations__summary">
            <article class="detail-operations__card" :class="toneClass(operationStatus.openTone)">
              <small>景区开闭园</small>
              <h3>{{ pickLocalized(operationStatus.openLabel) }}</h3>
              <p>{{ pickLocalized(operationStatus.openDetail) }}</p>
            </article>

            <article class="detail-operations__card" :class="toneClass(operationStatus.crowdTone)">
              <small>当前客流</small>
              <h3>{{ pickLocalized(operationStatus.crowdLabel) }}</h3>
              <p>{{ pickLocalized(operationStatus.crowdDetail) }}</p>
            </article>
          </div>

          <div class="detail-operations__alerts">
            <article
              v-for="alert in operationStatus.alerts"
              :key="alert.id"
              class="detail-operations__alert"
              :class="toneClass(alert.tone)"
            >
              <small>{{ pickLocalized(alert.tag) }}</small>
              <h3>{{ pickLocalized(alert.title) }}</h3>
              <p>{{ pickLocalized(alert.detail) }}</p>
            </article>
          </div>
        </section>

        <section id="section-rules" class="detail-section detail-section--rules" aria-labelledby="detail-rules-title" data-reveal>
          <header class="detail-section__head">
            <p>{{ t('detail.rules.eyebrow') }}</p>
            <h2 id="detail-rules-title">{{ t('detail.rules.title') }}</h2>
          </header>

          <div class="detail-rules">
            <article v-for="rule in ticketingRules" :key="rule.id">
              <small>{{ pickLocalized(rule.title) }}</small>
              <p>{{ pickLocalized(rule.detail) }}</p>
            </article>
          </div>
        </section>

        <section id="section-tickets" class="detail-section" aria-labelledby="ticket-title" data-reveal>
          <header class="detail-section__head">
            <p>{{ t('detail.section.tickets.label') }}</p>
            <h2 id="ticket-title">{{ t('common.ticketTypes') }}</h2>
          </header>

          <div class="ticket-list">
            <RouterLink
              v-for="ticket in tickets"
              :key="ticket.id"
              class="ticket-row"
              :to="{ path: '/booking', query: { spot: spot.id, ticket: ticket.id } }"
            >
              <div>
                <h3>{{ localizeTicketName(ticket) }}</h3>
                <p>{{ localizeTicketDescription(ticket) }}</p>
              </div>
              <span>{{ ticket.price === 0 ? t('booking.payment.free') : `¥${ticket.price}` }}</span>
              <small>{{ localizeTicketAudience(ticket) }}</small>
            </RouterLink>
            <p v-if="tickets.length === 0" class="detail-section__empty">{{ t('detail.ticketsEmpty') }}</p>
          </div>
        </section>

        <section id="section-slots" class="detail-section detail-section--slots" aria-labelledby="slot-title" data-reveal>
          <header class="detail-section__head">
            <p>{{ t('detail.section.slots.label') }}</p>
            <h2 id="slot-title">{{ t('common.availableSlots') }}</h2>
          </header>

          <div class="slot-grid">
            <template v-for="slot in slots" :key="slot.id">
              <RouterLink
                v-if="slot.remaining > 0"
                class="slot-card"
                :to="{ path: '/booking', query: { spot: spot.id, slot: slot.id } }"
              >
                <p>{{ slot.date }}</p>
                <h3>{{ slot.timeRange }}</h3>
                <span>{{ t('detail.slotRemaining', { remaining: slot.remaining, capacity: slot.capacity }) }}</span>
              </RouterLink>
              <div
                v-else
                class="slot-card is-disabled"
                aria-disabled="true"
              >
                <p>{{ slot.date }}</p>
                <h3>{{ slot.timeRange }}</h3>
                <span>{{ t('detail.slotRemaining', { remaining: slot.remaining, capacity: slot.capacity }) }}</span>
              </div>
            </template>
            <p v-if="slots.length === 0 && !apiError" class="detail-section__empty">{{ t('detail.slotsEmpty') }}</p>
            <p v-if="apiError" class="detail-section__empty">{{ apiError }}</p>
          </div>
        </section>

          </div><!-- /.detail-body__main -->

          <aside class="detail-body__rail">
            <TicketRail
              :spot-id="spot.id"
              :spot-name="localizeSpotName(spot)"
              :reservation-required="spot.reservationRequired"
              :paid="spot.paid"
              :tickets="tickets"
              :slots="slots"
              :today="today"
            />
          </aside>
        </div><!-- /.detail-body -->
      </template>

      <section v-else class="detail-empty" data-reveal>
        <p>{{ t('detail.empty') }}</p>
        <RouterLink to="/scenic-spots">{{ t('common.backToReservations') }}</RouterLink>
      </section>
    </main>
    <SiteFooter />
  </div>
</template>

<style scoped>
.detail-page {
  background: var(--paper-light);
  color: var(--ink);
  /* The mobile sticky CTA bar is 64px tall + safe-area; reserve room so the
     last section (slots) is never hidden behind it. Desktop value is 0. */
  padding-bottom: 0;
}

@media (max-width: 1023px) {
  .detail-page {
    padding-bottom: calc(72px + env(safe-area-inset-bottom, 0px));
  }
}

.detail-hero,
.detail-info,
.detail-section,
.detail-empty {
  max-width: 1320px;
  margin: 0 auto;
  padding-inline: clamp(20px, 3vw, 48px);
}

/* All anchored sections — make sure the smooth scroll lands BELOW both the
   site header AND the section-nav sticky bar. */
#section-overview,
#section-tickets,
#section-slots,
#section-practical,
#section-accessibility,
#section-rules {
  scroll-margin-top: calc(var(--site-header-h, 52px) + 64px);
}

/* Two-column grid: long-form content on the left, sticky purchase rail on
   the right. On screens < 1024px the rail collapses (it has its own
   `display:none` rule) and the content takes the full width. */
.detail-body {
  max-width: 1320px;
  margin: 0 auto;
  padding-inline: clamp(20px, 3vw, 48px);
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0;
}

.detail-body__main > .detail-info,
.detail-body__main > .detail-section,
.detail-body__main > .detail-guidance {
  /* Sections inside the grid no longer need their own max-width / inline
     padding — the grid container provides both. */
  max-width: none;
  padding-inline: 0;
  margin-left: 0;
  margin-right: 0;
}

.detail-body__rail {
  display: none;
}

@media (min-width: 1024px) {
  .detail-body {
    grid-template-columns: minmax(0, 1fr) 320px;
    gap: clamp(28px, 3vw, 56px);
  }

  .detail-body__rail {
    display: block;
  }
}

.detail-hero {
  padding-top: clamp(80px, 12vw, 152px);
  padding-bottom: clamp(60px, 8vw, 100px);
}

.detail-hero__meta {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 16px;
  margin-bottom: clamp(36px, 5vw, 60px);
  border-bottom: 1px solid rgba(16, 20, 18, 0.08);
  color: rgba(16, 20, 18, 0.42);
  font-size: 11px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
}

/* Prominent "back to spots list" pill — sits at the very top of the detail
   hero so users coming from the list always see how to return, instead of
   reaching for the browser/system back button (which often takes them all
   the way to /). Hover slides the arrow left to reinforce the direction. */
.detail-hero__back-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 22px;
  padding: 8px 16px 8px 12px;
  border: 1px solid rgba(31, 58, 52, 0.18);
  border-radius: 999px;
  background: rgba(31, 58, 52, 0.05);
  color: var(--deep-green);
  cursor: pointer;
  font-family: inherit;
  font-size: 13px;
  letter-spacing: 0.04em;
  line-height: 1;
  transition: background 220ms ease, border-color 220ms ease;
}

.detail-hero__back-chip:hover,
.detail-hero__back-chip:focus-visible {
  background: rgba(31, 58, 52, 0.12);
  border-color: rgba(31, 58, 52, 0.28);
  outline: none;
}

.detail-hero__back-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  transition: transform 220ms ease;
}

.detail-hero__back-chip:hover .detail-hero__back-icon,
.detail-hero__back-chip:focus-visible .detail-hero__back-icon {
  transform: translateX(-2px);
}

/* The page-crumbs that follow the chip should feel quieter so the chip is
   the single, obvious "go back" affordance. */
.detail-hero__back-chip + .page-crumbs {
  opacity: 0.78;
}

.detail-hero__layout {
  display: grid;
  grid-template-columns: minmax(0, 0.82fr) minmax(320px, 0.74fr);
  gap: clamp(34px, 6vw, 86px);
  align-items: end;
}

.detail-hero__eyebrow,
.detail-section__head p {
  color: rgba(16, 20, 18, 0.42);
  font-size: 11px;
  letter-spacing: 0.32em;
  text-transform: uppercase;
}

.detail-hero h1 {
  margin-top: 18px;
  font-family: var(--font-serif);
  font-size: clamp(46px, 7vw, 104px);
  font-weight: 400;
  letter-spacing: 0.08em;
  line-height: 1;
}

.detail-hero__en {
  margin-top: 18px;
  color: rgba(16, 20, 18, 0.48);
  font-size: 12px;
  letter-spacing: 0.34em;
  text-transform: uppercase;
}

.detail-hero__description {
  max-width: 38rem;
  margin-top: clamp(28px, 4vw, 44px);
  color: rgba(16, 20, 18, 0.68);
  font-family: var(--font-serif);
  font-size: clamp(17px, 1.4vw, 23px);
  letter-spacing: 0.04em;
  line-height: 1.9;
}

.detail-hero__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 24px;
}

.detail-hero__tags span {
  padding: 7px 10px;
  border: 1px solid rgba(16, 20, 18, 0.1);
  color: rgba(16, 20, 18, 0.5);
  font-size: 11px;
  letter-spacing: 0.18em;
}

.detail-hero__action {
  display: inline-flex;
  padding: 12px 20px;
  border: 1px solid rgba(31, 58, 52, 0.22);
  color: var(--deep-green);
  font-size: 12px;
  letter-spacing: 0.24em;
  transition: background 220ms ease, transform 220ms ease;
}

.detail-hero__action:hover,
.detail-hero__action:focus-visible {
  background: rgba(127, 156, 141, 0.12);
  transform: translateY(-1px);
  outline: none;
}

.detail-hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 34px;
}

.detail-hero__action--muted {
  color: rgba(16, 20, 18, 0.58);
}

.detail-hero__media {
  margin: 0;
  aspect-ratio: 4 / 4.8;
  overflow: hidden;
  border: 1px solid rgba(16, 20, 18, 0.08);
  background: rgba(216, 221, 214, 0.42);
}

.detail-hero__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 50% 50%;
  filter: saturate(0.82) contrast(0.94);
}

.detail-hero__placeholder {
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  color: rgba(31, 58, 52, 0.42);
  font-family: var(--font-serif);
  font-size: clamp(44px, 8vw, 96px);
  letter-spacing: 0.18em;
  background: linear-gradient(135deg, rgba(244, 239, 230, 0.96), rgba(216, 221, 214, 0.62));
}

.detail-info {
  padding-bottom: clamp(60px, 8vw, 100px);
}

.detail-guidance {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  max-width: 1320px;
  margin: 0 auto clamp(54px, 7vw, 92px);
  padding: 18px clamp(20px, 3vw, 48px);
  border-top: 1px solid rgba(16, 20, 18, 0.08);
  border-bottom: 1px solid rgba(16, 20, 18, 0.08);
  color: rgba(16, 20, 18, 0.58);
  font-size: 14px;
  line-height: 1.8;
}

.detail-guidance a {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border: 1px solid rgba(16, 20, 18, 0.1);
  color: rgba(16, 20, 18, 0.62);
  font-size: 11px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  transition: color 220ms ease, border-color 220ms ease, transform 220ms ease;
}

.detail-guidance a:hover,
.detail-guidance a:focus-visible {
  color: var(--deep-green);
  border-color: rgba(31, 58, 52, 0.2);
  transform: translateX(2px);
  outline: none;
}

.detail-info dl {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1px;
  margin: 0;
  border: 1px solid rgba(16, 20, 18, 0.08);
  background: rgba(16, 20, 18, 0.08);
}

.detail-info div {
  padding: clamp(20px, 2.4vw, 30px);
  background: rgba(250, 247, 240, 0.94);
}

.detail-info dt {
  color: rgba(16, 20, 18, 0.42);
  font-size: 11px;
  letter-spacing: 0.28em;
  text-transform: uppercase;
}

.detail-info dd {
  margin: 16px 0 0;
  color: rgba(16, 20, 18, 0.68);
  font-family: var(--font-serif);
  font-size: 15px;
  letter-spacing: 0.04em;
  line-height: 1.8;
}

.detail-section {
  padding-bottom: clamp(64px, 9vw, 118px);
}

.detail-section__head {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 18px;
  padding-bottom: 18px;
  margin-bottom: 28px;
  border-bottom: 1px solid rgba(16, 20, 18, 0.1);
}

.detail-section__head h2 {
  font-family: var(--font-serif);
  font-size: clamp(26px, 3vw, 42px);
  font-weight: 400;
  letter-spacing: 0.04em;
}

.detail-section--rules {
  padding-bottom: clamp(54px, 7vw, 92px);
}

.detail-section--practical {
  padding-bottom: clamp(54px, 7vw, 92px);
}

.detail-section--accessibility {
  padding-bottom: clamp(54px, 7vw, 92px);
}

.detail-section--operations {
  padding-bottom: clamp(54px, 7vw, 92px);
}

.detail-practical {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1px;
  border: 1px solid rgba(16, 20, 18, 0.08);
  background: rgba(16, 20, 18, 0.08);
}

.detail-practical__card {
  display: grid;
  align-content: start;
  gap: 14px;
  min-height: 188px;
  padding: 22px;
  background: rgba(250, 247, 240, 0.94);
}

.detail-practical__card small {
  color: rgba(16, 20, 18, 0.42);
  font-size: 11px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
}

.detail-practical__card p,
.detail-practical__card li {
  color: rgba(16, 20, 18, 0.62);
  font-size: 14px;
  line-height: 1.85;
}

.detail-practical__card ul {
  display: grid;
  gap: 10px;
  padding-left: 18px;
}

.detail-accessibility {
  display: grid;
  gap: 18px;
}

.detail-accessibility__overview,
.detail-accessibility__fit-card,
.detail-accessibility__facility-card {
  background: rgba(250, 247, 240, 0.94);
}

.detail-accessibility__overview {
  display: grid;
  gap: 14px;
  padding: 24px;
  border: 1px solid rgba(16, 20, 18, 0.08);
}

.detail-accessibility__overview small,
.detail-accessibility__block-label,
.detail-accessibility__fit-card small,
.detail-accessibility__facility-card small {
  color: rgba(16, 20, 18, 0.42);
  font-size: 11px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
}

.detail-accessibility__overview p {
  max-width: 62rem;
  color: rgba(16, 20, 18, 0.64);
  font-size: 15px;
  line-height: 1.85;
}

.detail-accessibility__block {
  display: grid;
  gap: 12px;
}

.detail-accessibility__fit-grid,
.detail-accessibility__facility-grid {
  display: grid;
  gap: 1px;
  border: 1px solid rgba(16, 20, 18, 0.08);
  background: rgba(16, 20, 18, 0.08);
}

.detail-accessibility__fit-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.detail-accessibility__facility-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.detail-accessibility__fit-card,
.detail-accessibility__facility-card {
  display: grid;
  align-content: start;
  gap: 14px;
  min-height: 128px;
  padding: 20px;
}

.detail-accessibility__fit-card strong,
.detail-accessibility__facility-card span {
  display: inline-flex;
  align-items: center;
  justify-self: start;
  padding: 8px 12px;
  border-radius: 999px;
  font-size: 12px;
  letter-spacing: 0.1em;
  line-height: 1;
}

.detail-accessibility .is-recommended,
.detail-accessibility .is-available {
  background: rgba(227, 237, 229, 0.96);
  color: rgba(34, 72, 54, 0.88);
}

.detail-accessibility .is-limited {
  background: rgba(247, 242, 232, 0.98);
  color: rgba(122, 83, 35, 0.92);
}

.detail-accessibility .is-not-recommended,
.detail-accessibility .is-not-available {
  background: rgba(245, 236, 229, 0.98);
  color: rgba(126, 65, 38, 0.92);
}

.detail-operations__summary,
.detail-operations__alerts {
  display: grid;
  gap: 1px;
  border: 1px solid rgba(16, 20, 18, 0.08);
  background: rgba(16, 20, 18, 0.08);
}

.detail-operations__summary {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.detail-operations__alerts {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-top: 18px;
}

.detail-operations__card,
.detail-operations__alert {
  display: grid;
  align-content: start;
  gap: 12px;
  min-height: 164px;
  padding: 20px;
  background: rgba(250, 247, 240, 0.94);
}

.detail-operations__card small,
.detail-operations__alert small {
  color: rgba(16, 20, 18, 0.42);
  font-size: 11px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
}

.detail-operations__card h3,
.detail-operations__alert h3 {
  font-family: var(--font-serif);
  font-size: clamp(24px, 2vw, 32px);
  font-weight: 400;
  letter-spacing: 0.04em;
  line-height: 1.24;
}

.detail-operations__card p,
.detail-operations__alert p {
  color: rgba(16, 20, 18, 0.62);
  font-size: 14px;
  line-height: 1.8;
}

.detail-operations__card.is-watch,
.detail-operations__alert.is-watch {
  background: rgba(250, 246, 238, 0.96);
}

.detail-operations__card.is-limited,
.detail-operations__alert.is-limited {
  background: rgba(247, 242, 232, 0.98);
  box-shadow: inset 3px 0 0 rgba(167, 121, 58, 0.4);
}

.detail-operations__card.is-closed,
.detail-operations__alert.is-closed {
  background: rgba(244, 237, 229, 0.98);
  box-shadow: inset 3px 0 0 rgba(146, 84, 52, 0.4);
}

.detail-rules {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 1px;
  border: 1px solid rgba(16, 20, 18, 0.08);
  background: rgba(16, 20, 18, 0.08);
}

.detail-rules article {
  display: grid;
  align-content: start;
  gap: 12px;
  min-height: 172px;
  padding: 18px;
  background: rgba(250, 247, 240, 0.94);
}

.detail-rules small {
  color: rgba(16, 20, 18, 0.42);
  font-size: 11px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
}

.detail-rules p {
  color: rgba(16, 20, 18, 0.62);
  font-size: 13px;
  line-height: 1.75;
}

.ticket-list {
  display: grid;
  gap: 0;
}

.ticket-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(9rem, auto) minmax(10rem, 0.3fr);
  gap: 24px;
  align-items: baseline;
  padding: 22px 0;
  border-bottom: 1px solid rgba(16, 20, 18, 0.09);
  color: inherit;
  transition: color 180ms ease, background 180ms ease;
}

.ticket-row:hover,
.ticket-row:focus-visible {
  color: var(--deep-green);
  background: linear-gradient(90deg, rgba(127, 156, 141, 0.08), transparent 42%);
  outline: none;
}

.ticket-row h3 {
  font-family: var(--font-serif);
  font-size: 22px;
  font-weight: 400;
  letter-spacing: 0.05em;
}

.ticket-row p,
.ticket-row small,
.ticket-row span,
.detail-section__empty {
  color: rgba(16, 20, 18, 0.56);
  font-size: 13px;
  letter-spacing: 0.05em;
  line-height: 1.75;
}

.ticket-row span {
  color: rgba(31, 58, 52, 0.72);
}

.slot-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1px;
  border: 1px solid rgba(16, 20, 18, 0.08);
  background: rgba(16, 20, 18, 0.08);
}

.slot-card {
  display: block;
  padding: 22px;
  background: rgba(250, 247, 240, 0.94);
  color: inherit;
  transition: background 180ms ease, color 180ms ease;
}

.slot-card:hover,
.slot-card:focus-visible {
  color: var(--deep-green);
  background: rgba(232, 239, 233, 0.96);
  outline: none;
}

.slot-card.is-disabled {
  pointer-events: none;
  color: rgba(16, 20, 18, 0.36);
  background: rgba(244, 239, 230, 0.62);
}

.slot-card p,
.slot-card span {
  color: rgba(16, 20, 18, 0.46);
  font-size: 11px;
  letter-spacing: 0.26em;
  text-transform: uppercase;
}

.slot-card h3 {
  margin: 16px 0;
  font-family: var(--font-serif);
  font-size: 22px;
  font-weight: 400;
  letter-spacing: 0.04em;
}

.detail-empty {
  min-height: 54vh;
  display: grid;
  align-content: center;
  gap: 18px;
  padding-block: 100px;
}

.detail-empty p {
  font-family: var(--font-serif);
  font-size: 32px;
}

.detail-empty a {
  color: var(--deep-green);
  font-size: 12px;
  letter-spacing: 0.24em;
}

@media (max-width: 980px) {
  .detail-hero__layout,
  .detail-info dl,
  .detail-practical,
  .detail-accessibility__fit-grid,
  .detail-accessibility__facility-grid,
  .detail-operations__summary,
  .detail-operations__alerts,
  .detail-rules,
  .slot-grid {
    grid-template-columns: 1fr 1fr;
  }

  .detail-guidance {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 640px) {
  .detail-hero,
  .detail-info,
  .detail-section,
  .detail-empty {
    padding-inline: 18px;
  }

  .detail-hero__layout,
  .detail-info dl,
  .ticket-row,
  .detail-practical,
  .detail-accessibility__fit-grid,
  .detail-accessibility__facility-grid,
  .detail-operations__summary,
  .detail-operations__alerts,
  .detail-rules,
  .slot-grid {
    grid-template-columns: 1fr;
  }

  .detail-hero__media {
    aspect-ratio: 4 / 3;
  }
}
</style>
