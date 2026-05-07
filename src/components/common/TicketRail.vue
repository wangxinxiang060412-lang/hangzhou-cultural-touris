<script setup lang="ts">
import { computed } from 'vue'
import { t } from '../../i18n/site'
import type { ApiBookingSlot, ApiTicketType } from '../../services/api'
import { scrollToAnchor } from '../../utils/scroll'

const props = defineProps<{
  spotId: string
  spotName: string
  reservationRequired: boolean
  paid: boolean
  tickets: ApiTicketType[]
  slots: ApiBookingSlot[]
  /** YYYY-MM-DD of "today" in local time */
  today: string
}>()

const minPrice = computed(() => {
  const paid = props.tickets.filter((ticket) => ticket.price > 0)
  if (paid.length === 0) return 0
  return paid.reduce((min, ticket) => Math.min(min, ticket.price), Number.POSITIVE_INFINITY)
})

const todaySlots = computed(() => props.slots.filter((slot) => slot.date === props.today))
const todayHasCapacity = computed(() => todaySlots.value.some((slot) => slot.remaining > 0))
const upcomingSlot = computed(() =>
  props.slots.find((slot) => slot.date > props.today && slot.remaining > 0) ?? null,
)

const priceLabel = computed(() => {
  if (!props.paid) return t('detail.rail.openVisit')
  if (props.tickets.length === 0) return t('detail.rail.empty')
  if (minPrice.value === 0 || !Number.isFinite(minPrice.value)) return t('detail.rail.priceFree')
  return t('detail.rail.priceFrom', { price: minPrice.value })
})

const availabilityLabel = computed(() => {
  if (todaySlots.value.length > 0) {
    return todayHasCapacity.value ? t('detail.rail.todayAvailable') : t('detail.rail.todayFull')
  }
  if (upcomingSlot.value) {
    return t('detail.rail.upcoming', {
      date: upcomingSlot.value.date,
      timeRange: upcomingSlot.value.timeRange,
    })
  }
  return t('detail.rail.empty')
})

/** Mute the rail when nothing meaningful to act on (e.g. open-access spots) */
const isOpenAccess = computed(() => !props.reservationRequired && !props.paid)

const reservationTo = computed(() => ({
  path: '/booking',
  query: { spot: props.spotId },
}))
</script>

<template>
  <!-- Desktop: sticky right rail next to the long detail content -->
  <aside class="ticket-rail" :aria-label="t('detail.rail.title')">
    <div class="ticket-rail__inner">
      <header class="ticket-rail__head">
        <small>{{ t('detail.rail.title') }}</small>
        <h3>{{ spotName }}</h3>
      </header>

      <dl class="ticket-rail__facts">
        <div>
          <dt>{{ t('detail.field.ticketing') }}</dt>
          <dd>{{ priceLabel }}</dd>
        </div>
        <div>
          <dt>{{ t('detail.field.openingHours') }}</dt>
          <dd>{{ availabilityLabel }}</dd>
        </div>
      </dl>

      <RouterLink class="ticket-rail__cta" :to="reservationTo">
        {{ isOpenAccess ? t('detail.rail.openVisit') : t('common.startReservation') }}
      </RouterLink>

      <div class="ticket-rail__jumps">
        <button type="button" @click="scrollToAnchor('section-tickets')">
          {{ t('detail.rail.viewTickets') }}
        </button>
        <button type="button" @click="scrollToAnchor('section-slots')">
          {{ t('detail.rail.viewSlots') }}
        </button>
      </div>
    </div>
  </aside>

  <!-- Mobile: a single sticky bottom bar with the same primary CTA -->
  <div class="ticket-rail-bar" :aria-label="t('detail.rail.title')">
    <div class="ticket-rail-bar__copy">
      <strong>{{ priceLabel }}</strong>
      <small>{{ availabilityLabel }}</small>
    </div>
    <RouterLink class="ticket-rail-bar__cta" :to="reservationTo">
      {{ isOpenAccess ? t('detail.rail.openVisit') : t('common.startReservation') }}
    </RouterLink>
  </div>
</template>

<style scoped>
/* ===== Desktop right rail ============================================== */
.ticket-rail {
  display: none;
}

@media (min-width: 1024px) {
  .ticket-rail {
    display: block;
    position: sticky;
    /* Sit just below the sticky site header AND the section-nav (≈ 56px). */
    top: calc(var(--site-header-h, 52px) + 64px);
    align-self: start;
    width: 100%;
    margin-top: 0;
  }
}

.ticket-rail__inner {
  display: grid;
  gap: 22px;
  padding: 24px;
  border: 1px solid rgba(16, 20, 18, 0.1);
  border-radius: 6px;
  background: rgba(250, 247, 240, 0.96);
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
  box-shadow: 0 18px 40px rgba(36, 42, 39, 0.06);
}

.ticket-rail__head small {
  display: block;
  margin-bottom: 6px;
  color: rgba(16, 20, 18, 0.42);
  font-size: 11px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
}

.ticket-rail__head h3 {
  font-family: var(--font-serif);
  font-size: 22px;
  font-weight: 400;
  letter-spacing: 0.04em;
  line-height: 1.3;
}

.ticket-rail__facts {
  display: grid;
  gap: 14px;
  margin: 0;
  padding-top: 12px;
  border-top: 1px solid rgba(16, 20, 18, 0.08);
}

.ticket-rail__facts > div {
  display: grid;
  gap: 4px;
}

.ticket-rail__facts dt {
  color: rgba(16, 20, 18, 0.44);
  font-size: 11px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
}

.ticket-rail__facts dd {
  margin: 0;
  color: var(--ink);
  font-family: var(--font-serif);
  font-size: 17px;
  letter-spacing: 0.02em;
  line-height: 1.4;
}

.ticket-rail__cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  padding: 12px 16px;
  border-radius: 999px;
  background: var(--deep-green);
  color: var(--paper-light);
  font-size: 13px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  text-align: center;
  transition: opacity 180ms ease, transform 180ms ease;
}

.ticket-rail__cta:hover,
.ticket-rail__cta:focus-visible {
  opacity: 0.92;
  transform: translateY(-1px);
  outline: none;
}

.ticket-rail__jumps {
  display: grid;
  gap: 8px;
}

.ticket-rail__jumps button {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border: 1px solid rgba(31, 58, 52, 0.16);
  border-radius: 999px;
  background: transparent;
  color: var(--deep-green);
  cursor: pointer;
  font-family: inherit;
  font-size: 12px;
  letter-spacing: 0.16em;
  transition: background 180ms ease, border-color 180ms ease;
}

.ticket-rail__jumps button::after {
  content: '↓';
  margin-left: 10px;
  opacity: 0.62;
}

.ticket-rail__jumps button:hover,
.ticket-rail__jumps button:focus-visible {
  background: rgba(31, 58, 52, 0.06);
  border-color: rgba(31, 58, 52, 0.28);
  outline: none;
}

/* ===== Mobile bottom bar =============================================== */
.ticket-rail-bar {
  display: none;
}

@media (max-width: 1023px) {
  .ticket-rail-bar {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 35;
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 12px;
    padding: 10px 16px calc(10px + env(safe-area-inset-bottom, 0px));
    background: rgba(250, 247, 240, 0.96);
    -webkit-backdrop-filter: blur(16px) saturate(1.1);
    backdrop-filter: blur(16px) saturate(1.1);
    border-top: 1px solid rgba(16, 20, 18, 0.1);
    box-shadow: 0 -10px 30px rgba(36, 42, 39, 0.1);
  }
}

.ticket-rail-bar__copy {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.ticket-rail-bar__copy strong {
  font-family: var(--font-serif);
  font-size: 16px;
  font-weight: 400;
  letter-spacing: 0.02em;
  color: var(--ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ticket-rail-bar__copy small {
  color: rgba(16, 20, 18, 0.6);
  font-size: 12px;
  letter-spacing: 0.04em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ticket-rail-bar__cta {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: 10px 18px;
  border-radius: 999px;
  background: var(--deep-green);
  color: var(--paper-light);
  font-size: 13px;
  letter-spacing: 0.16em;
  white-space: nowrap;
  text-transform: uppercase;
}

.ticket-rail-bar__cta:active {
  transform: scale(0.98);
}
</style>
