<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageCrumbs from '../components/common/PageCrumbs.vue'
import SiteFooter from '../components/layout/SiteFooter.vue'
import { getSpotImage, getSpotImagePosition } from '../data/spotImages'
import { t } from '../i18n/site'
import { fetchBookingSlots, fetchTicketTypes } from '../services/api'
import type { ApiBookingSlot, ApiTicketType } from '../services/api'
import { ensureCatalog, findScenicSpot } from '../stores/catalog'
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
const router = useRouter()
const slots = ref<ApiBookingSlot[]>([])
const tickets = ref<ApiTicketType[]>([])
const apiError = ref('')
const today = formatLocalDate(new Date())

const spot = computed(() => {
  const id = typeof route.params.id === 'string' ? route.params.id : ''
  return id ? findScenicSpot(id) : null
})

const heroImage = computed(() => (spot.value ? getSpotImage(spot.value.id) : null))

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
    return
  }
  void router.push('/scenic-spots')
}

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
})
</script>

<template>
  <div class="page-shell">
    <main id="main-content" class="detail-page" tabindex="-1">
      <template v-if="spot">
        <section class="detail-hero" aria-labelledby="detail-title" data-reveal>
          <PageCrumbs
            :items="[
              { label: t('page.home'), to: '/' },
              { label: t('scenic.title'), to: '/scenic-spots' },
              { label: localizeSpotName(spot) },
            ]"
          />

          <button type="button" class="detail-hero__back" @click="goBack">{{ t('common.back') }}</button>

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

        <section class="detail-guidance" :aria-label="t('detail.guidanceAria')" data-reveal="soft">
          <p>{{ t('detail.guidance') }}</p>
          <RouterLink to="/visit-guide">{{ t('detail.gotoGuide') }}</RouterLink>
        </section>

        <section class="detail-section" aria-labelledby="ticket-title" data-reveal>
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

        <section class="detail-section detail-section--slots" aria-labelledby="slot-title" data-reveal>
          <header class="detail-section__head">
            <p>{{ t('detail.section.slots.label') }}</p>
            <h2 id="slot-title">{{ t('common.availableSlots') }}</h2>
          </header>

          <div class="slot-grid">
            <RouterLink
              v-for="slot in slots"
              :key="slot.id"
              class="slot-card"
              :class="{ 'is-disabled': slot.remaining <= 0 }"
              :to="slot.remaining > 0 ? { path: '/booking', query: { spot: spot.id, slot: slot.id } } : route.fullPath"
              :aria-disabled="slot.remaining <= 0 ? 'true' : undefined"
            >
              <p>{{ slot.date }}</p>
              <h3>{{ slot.timeRange }}</h3>
              <span>{{ t('detail.slotRemaining', { remaining: slot.remaining, capacity: slot.capacity }) }}</span>
            </RouterLink>
            <p v-if="slots.length === 0 && !apiError" class="detail-section__empty">{{ t('detail.slotsEmpty') }}</p>
            <p v-if="apiError" class="detail-section__empty">{{ apiError }}</p>
          </div>
        </section>
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
}

.detail-hero,
.detail-info,
.detail-section,
.detail-empty {
  max-width: 1320px;
  margin: 0 auto;
  padding-inline: clamp(20px, 3vw, 48px);
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

.detail-hero__back {
  margin-bottom: 20px;
  border: 0;
  background: transparent;
  color: rgba(16, 20, 18, 0.54);
  cursor: pointer;
  font-size: 11px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
}

.detail-hero__back:hover,
.detail-hero__back:focus-visible {
  color: var(--deep-green);
  outline: none;
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
  .slot-grid {
    grid-template-columns: 1fr;
  }

  .detail-hero__media {
    aspect-ratio: 4 / 3;
  }
}
</style>
