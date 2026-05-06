<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageCrumbs from '../components/common/PageCrumbs.vue'
import SiteFooter from '../components/layout/SiteFooter.vue'
import { visitGuidePolicies } from '../data/visitGuide'
import type { BookingPaymentMethod } from '../data/mockOrders'
import { pickLocalized, t } from '../i18n/site'
import { createBookingOrder, fetchBookingSlots, fetchTicketTypes } from '../services/api'
import type { ApiBookingSlot, ApiTicketType } from '../services/api'
import { ensureCatalog, scenicSpots } from '../stores/catalog'
import { formatLocalDate } from '../utils/date'
import {
  localizeSpotArea,
  localizeSpotName,
  localizeTicketAudience,
  localizeTicketDescription,
  localizeTicketName,
} from '../utils/localization'

const route = useRoute()
const router = useRouter()

const step = ref(1)
const selectedSpotId = ref('')
const selectedTicketId = ref('')
const selectedSlotId = ref('')
const selectedPaymentMethod = ref<BookingPaymentMethod>('free')
const visitorName = ref('')
const visitorPhone = ref('')
const visitorIdNumber = ref('')
const visitorCount = ref(1)
const submittedOrderId = ref('')
const submittedQrCode = ref('')
const bookingFlowEl = ref<HTMLElement | null>(null)
const slots = ref<ApiBookingSlot[]>([])
const tickets = ref<ApiTicketType[]>([])
const apiError = ref('')
const isSubmitting = ref(false)
const today = formatLocalDate(new Date())

const requestedSpotId = computed(() => {
  const value = route.query.spot
  return typeof value === 'string' ? value : ''
})
const requestedTicketId = computed(() => {
  const value = route.query.ticket
  return typeof value === 'string' ? value : ''
})
const requestedSlotId = computed(() => {
  const value = route.query.slot
  return typeof value === 'string' ? value : ''
})

const selectedSpot = computed(
  () =>
    scenicSpots.value.find((spot) => spot.id === selectedSpotId.value) ??
    scenicSpots.value[0] ??
    null,
)
const selectedTicket = computed(() => tickets.value.find((ticket) => ticket.id === selectedTicketId.value))
const selectedSlot = computed(() => slots.value.find((slot) => slot.id === selectedSlotId.value))
const selectedSlotRemaining = computed(() => selectedSlot.value?.remaining ?? 0)
const totalAmount = computed(() => (selectedTicket.value?.price ?? 0) * visitorCount.value)

const visitorCountIsValid = computed(
  () =>
    typeof visitorCount.value === 'number' &&
    Number.isFinite(visitorCount.value) &&
    visitorCount.value >= 1 &&
    visitorCount.value <= 8,
)
const phoneIsValid = computed(() => /^[0-9+\-\s]{7,20}$/.test(visitorPhone.value.trim()))
const idNumberIsValid = computed(() => visitorIdNumber.value.trim().length >= 4)
const paymentMethodIsValid = computed(
  () => totalAmount.value === 0 || selectedPaymentMethod.value !== 'free',
)

const paymentMethodOptions = computed(() =>
  totalAmount.value === 0
    ? [{ id: 'free' as BookingPaymentMethod, label: t('booking.payment.free'), note: '0' }]
    : [
        { id: 'alipay' as BookingPaymentMethod, label: t('booking.payment.alipay'), note: 'Alipay' },
        { id: 'wechat' as BookingPaymentMethod, label: t('booking.payment.wechat'), note: 'WeChat Pay' },
        { id: 'unionpay' as BookingPaymentMethod, label: t('booking.payment.unionpay'), note: 'UnionPay' },
      ],
)

const canGoStep2 = computed(() => Boolean(selectedTicketId.value && selectedSlotId.value))
const canSubmit = computed(
  () =>
    canGoStep2.value &&
    visitorName.value.trim().length > 1 &&
    phoneIsValid.value &&
    idNumberIsValid.value &&
    visitorCountIsValid.value &&
    paymentMethodIsValid.value &&
    selectedSlotRemaining.value >= visitorCount.value &&
    !isSubmitting.value,
)

const totalText = computed(() => {
  if (!selectedTicket.value) return t('booking.summary.toBeSelected')
  if (totalAmount.value === 0) return t('booking.payment.free')
  return `¥${totalAmount.value}`
})

const paymentMethodText = computed(() => {
  switch (selectedPaymentMethod.value) {
    case 'alipay':
      return t('booking.payment.alipay')
    case 'wechat':
      return t('booking.payment.wechat')
    case 'unionpay':
      return t('booking.payment.unionpay')
    default:
      return t('booking.payment.free')
  }
})

const resetSelection = () => {
  const preferredTicket = tickets.value.find((ticket) => ticket.id === requestedTicketId.value)
  const preferredSlot = slots.value.find(
    (slot) => slot.id === requestedSlotId.value && slot.remaining > 0,
  )
  selectedTicketId.value = preferredTicket?.id ?? tickets.value[0]?.id ?? ''
  selectedSlotId.value =
    preferredSlot?.id ?? slots.value.find((slot) => slot.remaining > 0)?.id ?? slots.value[0]?.id ?? ''
  selectedPaymentMethod.value = (selectedTicket.value?.price ?? 0) > 0 ? 'alipay' : 'free'
  step.value = 1
  submittedOrderId.value = ''
  submittedQrCode.value = ''
}

const resetVisitorForm = () => {
  visitorName.value = ''
  visitorPhone.value = ''
  visitorIdNumber.value = ''
  visitorCount.value = 1
}

const loadSlots = async (resetCurrentSelection = true) => {
  if (!selectedSpotId.value) return

  try {
    apiError.value = ''
    const [nextSlots, nextTickets] = await Promise.all([
      fetchBookingSlots(selectedSpotId.value),
      fetchTicketTypes(selectedSpotId.value),
    ])
    slots.value = nextSlots.filter((slot) => slot.date >= today).slice(0, 12)
    tickets.value = nextTickets
    if (resetCurrentSelection) {
      resetSelection()
    } else if (totalAmount.value > 0 && selectedPaymentMethod.value === 'free') {
      selectedPaymentMethod.value = 'alipay'
    }
  } catch (error) {
    slots.value = []
    tickets.value = []
    apiError.value = error instanceof Error ? error.message : t('booking.dataError')
  }
}

const startAnotherBooking = async () => {
  resetVisitorForm()
  resetSelection()
  await nextTick()
  bookingFlowEl.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const submitBooking = async () => {
  if (
    !canSubmit.value ||
    !selectedSlot.value ||
    !selectedTicket.value ||
    selectedSlotRemaining.value < visitorCount.value
  ) {
    return
  }

  const currentSpot = selectedSpot.value
  if (!currentSpot) return

  try {
    isSubmitting.value = true
    apiError.value = ''
    const order = await createBookingOrder({
      scenicSpotId: currentSpot.id,
      slotId: selectedSlot.value.id,
      ticketName: localizeTicketName(selectedTicket.value),
      paymentMethod: selectedPaymentMethod.value,
      visitorName: visitorName.value.trim(),
      visitorPhone: visitorPhone.value.trim(),
      visitorIdNumber: visitorIdNumber.value.trim(),
      visitorCount: visitorCount.value,
    })

    submittedOrderId.value = order.id
    submittedQrCode.value = order.qrCodeText
    step.value = 3
    await loadSlots(false)
  } catch (error) {
    apiError.value = error instanceof Error ? error.message : t('booking.submitError')
  } finally {
    isSubmitting.value = false
  }
}

const resolveSpotIdFromList = () => {
  if (scenicSpots.value.length === 0) return ''
  const requested = requestedSpotId.value
  if (requested && scenicSpots.value.some((spot) => spot.id === requested)) {
    return requested
  }
  return scenicSpots.value[0]?.id ?? ''
}

watch(
  [requestedSpotId, scenicSpots],
  () => {
    const nextSpotId = resolveSpotIdFromList()
    if (nextSpotId && selectedSpotId.value !== nextSpotId) {
      selectedSpotId.value = nextSpotId
    }
  },
  { immediate: true },
)

watch(
  selectedSpotId,
  async (value) => {
    if (!value) return
    if (route.query.spot !== value) {
      void router.replace({ query: { spot: value } })
    }
    await loadSlots()
  },
  { immediate: true },
)

watch(totalAmount, (amount) => {
  if (amount === 0) {
    selectedPaymentMethod.value = 'free'
    return
  }

  if (selectedPaymentMethod.value === 'free') {
    selectedPaymentMethod.value = 'alipay'
  }
})

watch([requestedTicketId, requestedSlotId], () => {
  if (step.value !== 1) return
  const preferredTicket = tickets.value.find((ticket) => ticket.id === requestedTicketId.value)
  const preferredSlot = slots.value.find(
    (slot) => slot.id === requestedSlotId.value && slot.remaining > 0,
  )
  if (preferredTicket) selectedTicketId.value = preferredTicket.id
  if (preferredSlot) selectedSlotId.value = preferredSlot.id
})

onMounted(() => {
  void ensureCatalog()
})
</script>

<template>
  <div class="page-shell">
    <main id="main-content" class="booking-page" tabindex="-1">
      <section class="booking-hero" aria-labelledby="booking-title" data-reveal>
        <PageCrumbs
          :items="[
            { label: t('page.home'), to: '/' },
            { label: t('scenic.title'), to: '/scenic-spots' },
            { label: t('booking.title') },
          ]"
        />

        <div class="booking-hero__meta">
          <span>{{ t('booking.title') }}</span>
          <span>{{ t('booking.metaRight') }}</span>
        </div>

        <div class="booking-hero__layout">
          <div>
            <p class="booking-hero__eyebrow">{{ t('booking.eyebrow') }}</p>
            <h1 id="booking-title">{{ t('booking.title') }}</h1>
            <p class="booking-hero__description">
              {{ t('booking.heroDescription', { name: selectedSpot ? localizeSpotName(selectedSpot) : t('booking.heroLoading') }) }}
            </p>
          </div>
          <div class="booking-hero__links">
            <RouterLink to="/scenic-spots" class="booking-hero__back">{{ t('booking.changeSpot') }}</RouterLink>
            <RouterLink to="/visit-guide" class="booking-hero__back">{{ t('page.visitGuide') }}</RouterLink>
          </div>
        </div>
      </section>

      <section class="booking-notes" :aria-label="t('booking.notesAria')" data-reveal="soft">
        <article v-for="policy in visitGuidePolicies" :key="policy.id">
          <small>{{ pickLocalized(policy.title) }}</small>
          <p>{{ pickLocalized(policy.detail) }}</p>
        </article>
      </section>

      <section ref="bookingFlowEl" class="booking-flow" :aria-label="t('booking.flowAria')" data-reveal>
        <ol class="booking-steps">
          <li :class="{ 'is-active': step === 1, 'is-done': step > 1 }">{{ t('booking.step1') }}</li>
          <li :class="{ 'is-active': step === 2, 'is-done': step > 2 }">{{ t('booking.step2') }}</li>
          <li :class="{ 'is-active': step === 3 }">{{ t('booking.step3') }}</li>
        </ol>

        <div v-if="step === 1" class="booking-panel">
          <section class="booking-panel__section" aria-labelledby="spot-select-title">
            <header>
              <p>{{ t('booking.section.spot') }}</p>
              <h2 id="spot-select-title">{{ t('booking.section.spotTitle') }}</h2>
            </header>

            <label class="spot-select">
              <span>{{ t('booking.spot') }}</span>
              <select v-model="selectedSpotId">
                <option v-for="spot in scenicSpots" :key="spot.id" :value="spot.id">
                  {{ localizeSpotName(spot) }} · {{ localizeSpotArea(spot) }}
                </option>
              </select>
            </label>
          </section>

          <section class="booking-panel__section" aria-labelledby="ticket-select-title">
            <header>
              <p>{{ t('booking.section.ticket') }}</p>
              <h2 id="ticket-select-title">{{ t('booking.section.ticketTitle') }}</h2>
            </header>

            <div class="booking-options">
              <label
                v-for="ticket in tickets"
                :key="ticket.id"
                class="booking-option"
                :class="{ 'is-selected': selectedTicketId === ticket.id }"
              >
                <input v-model="selectedTicketId" type="radio" name="ticket" :value="ticket.id" />
                <span>
                  <strong>{{ localizeTicketName(ticket) }}</strong>
                  <small>{{ localizeTicketDescription(ticket) }}</small>
                  <small>{{ localizeTicketAudience(ticket) }}</small>
                </span>
                <em>{{ ticket.price === 0 ? t('booking.payment.free') : `¥${ticket.price}` }}</em>
              </label>
            </div>
          </section>

          <section class="booking-panel__section" aria-labelledby="slot-select-title">
            <header>
              <p>{{ t('booking.section.slot') }}</p>
              <h2 id="slot-select-title">{{ t('booking.section.slotTitle') }}</h2>
            </header>

            <div class="slot-options">
              <label
                v-for="slot in slots"
                :key="slot.id"
                class="slot-option"
                :class="{
                  'is-selected': selectedSlotId === slot.id,
                  'is-disabled': slot.remaining <= 0,
                }"
              >
                <input
                  v-model="selectedSlotId"
                  type="radio"
                  name="slot"
                  :value="slot.id"
                  :disabled="slot.remaining <= 0"
                />
                <span>{{ slot.date }}</span>
                <strong>{{ slot.timeRange }}</strong>
                <small>{{ slot.remaining > 0 ? t('booking.slot.remaining', { count: slot.remaining }) : t('booking.slot.full') }}</small>
              </label>
            </div>
            <p v-if="slots.length === 0 && !apiError" class="visitor-form__hint visitor-form__hint--warning">
              {{ t('booking.slotsEmpty') }}
            </p>
            <p v-if="apiError" class="visitor-form__hint visitor-form__hint--warning">{{ apiError }}</p>
          </section>

          <button type="button" class="booking-primary" :disabled="!canGoStep2" @click="step = 2">
            {{ t('booking.next') }}
          </button>
        </div>

        <div v-else-if="step === 2" class="booking-panel">
          <section class="booking-panel__section" aria-labelledby="visitor-title">
            <header>
              <p>{{ t('booking.section.visitor') }}</p>
              <h2 id="visitor-title">{{ t('booking.section.visitorTitle') }}</h2>
            </header>

            <div class="visitor-form">
              <label :class="{ 'has-warning': visitorName && visitorName.trim().length <= 1 }">
                <span>{{ t('booking.visitorName') }}</span>
                <input v-model="visitorName" type="text" autocomplete="name" :placeholder="t('booking.placeholder.name')" />
              </label>
              <label :class="{ 'has-warning': visitorPhone && !phoneIsValid }">
                <span>{{ t('booking.phone') }}</span>
                <input v-model="visitorPhone" type="tel" autocomplete="tel" :placeholder="t('booking.placeholder.phone')" />
              </label>
              <label :class="{ 'has-warning': visitorIdNumber && !idNumberIsValid }">
                <span>{{ t('booking.idNumber') }}</span>
                <input v-model="visitorIdNumber" type="text" :placeholder="t('booking.placeholder.id')" />
              </label>
              <label :class="{ 'has-warning': !visitorCountIsValid }">
                <span>{{ t('booking.visitors') }}</span>
                <input v-model.number="visitorCount" type="number" min="1" max="8" />
              </label>
            </div>
            <p class="visitor-form__hint">
              {{ t('booking.visitorHint') }}
            </p>
          </section>

          <section class="booking-panel__section" aria-labelledby="payment-title">
            <header>
              <p>{{ t('booking.section.payment') }}</p>
              <h2 id="payment-title">{{ t('booking.paymentMethod') }}</h2>
            </header>

            <div class="payment-options">
              <label
                v-for="option in paymentMethodOptions"
                :key="option.id"
                class="payment-option"
                :class="{ 'is-selected': selectedPaymentMethod === option.id }"
              >
                <input v-model="selectedPaymentMethod" type="radio" name="payment-method" :value="option.id" />
                <span>
                  <strong>{{ option.label }}</strong>
                  <small>{{ totalAmount === 0 ? t('booking.payment.freeNote') : t('booking.payment.paidNote') }}</small>
                </span>
                <em>{{ option.note }}</em>
              </label>
            </div>
          </section>

          <aside class="booking-summary" :aria-label="t('booking.summary')">
            <p>{{ t('booking.summary') }}</p>
            <dl>
              <div>
                <dt>{{ t('booking.summary.spot') }}</dt>
                <dd>{{ selectedSpot ? localizeSpotName(selectedSpot) : t('booking.summary.notSelected') }}</dd>
              </div>
              <div>
                <dt>{{ t('booking.summary.ticket') }}</dt>
                <dd>{{ selectedTicket ? localizeTicketName(selectedTicket) : t('booking.summary.notSelected') }}</dd>
              </div>
              <div>
                <dt>{{ t('booking.summary.time') }}</dt>
                <dd>{{ selectedSlot?.date }} {{ selectedSlot?.timeRange }}</dd>
              </div>
              <div>
                <dt>{{ t('booking.summary.cost') }}</dt>
                <dd>{{ totalText }}</dd>
              </div>
              <div>
                <dt>{{ t('booking.paymentMethod') }}</dt>
                <dd>{{ paymentMethodText }}</dd>
              </div>
              <div>
                <dt>{{ t('booking.summary.remaining') }}</dt>
                <dd>{{ t('common.persons', { count: selectedSlotRemaining }) }}</dd>
              </div>
            </dl>
          </aside>

          <p
            v-if="selectedSlot && selectedSlotRemaining < visitorCount"
            class="visitor-form__hint visitor-form__hint--warning"
          >
            {{ t('booking.slotShortage') }}
          </p>
          <p v-if="apiError" class="visitor-form__hint visitor-form__hint--warning">{{ apiError }}</p>

          <div class="booking-actions">
            <button type="button" class="booking-secondary" @click="step = 1">{{ t('booking.previous') }}</button>
            <button type="button" class="booking-primary" :disabled="!canSubmit" @click="submitBooking">
              {{ isSubmitting ? t('booking.submitting') : t('booking.confirm') }}
            </button>
          </div>
        </div>

        <div v-else class="booking-success">
          <p class="booking-success__eyebrow">{{ t('booking.success.eyebrow') }}</p>
          <h2>{{ t('booking.success') }}</h2>
          <dl>
            <div>
              <dt>{{ t('booking.success.orderId') }}</dt>
              <dd>{{ submittedOrderId }}</dd>
            </div>
            <div>
              <dt>{{ t('booking.success.spot') }}</dt>
              <dd>{{ selectedSpot ? localizeSpotName(selectedSpot) : '—' }}</dd>
            </div>
            <div>
              <dt>{{ t('booking.success.date') }}</dt>
              <dd>{{ selectedSlot?.date }}</dd>
            </div>
            <div>
              <dt>{{ t('booking.success.timeRange') }}</dt>
              <dd>{{ selectedSlot?.timeRange }}</dd>
            </div>
            <div>
              <dt>{{ t('booking.success.visitorCount') }}</dt>
              <dd>{{ t('common.persons', { count: visitorCount }) }}</dd>
            </div>
            <div>
              <dt>{{ t('booking.paymentMethod') }}</dt>
              <dd>{{ paymentMethodText }}</dd>
            </div>
            <div>
              <dt>{{ t('booking.success.payResult') }}</dt>
              <dd>{{ totalAmount > 0 ? t('booking.success.payDone', { amount: totalAmount }) : t('booking.payment.free') }}</dd>
            </div>
            <div>
              <dt>{{ t('booking.success.voucher') }}</dt>
              <dd>{{ submittedQrCode }}</dd>
            </div>
          </dl>
          <div class="booking-success__actions">
            <RouterLink to="/orders" class="booking-primary booking-primary--link">{{ t('booking.viewOrders') }}</RouterLink>
            <button type="button" class="booking-secondary" @click="startAnotherBooking">{{ t('booking.continue') }}</button>
          </div>
        </div>
      </section>
    </main>
    <SiteFooter />
  </div>
</template>

<style scoped>
.booking-page {
  background: var(--paper-light);
  color: var(--ink);
}

.booking-hero,
.booking-flow {
  max-width: 1320px;
  margin: 0 auto;
  padding-inline: clamp(20px, 3vw, 48px);
}

.booking-hero {
  padding-top: clamp(80px, 12vw, 152px);
  padding-bottom: clamp(46px, 7vw, 90px);
}

.booking-hero__meta {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 16px;
  margin-bottom: clamp(36px, 5vw, 56px);
  border-bottom: 1px solid rgba(16, 20, 18, 0.08);
  color: rgba(16, 20, 18, 0.42);
  font-size: 11px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
}

.booking-hero__layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 24px;
  align-items: end;
}

.booking-hero__links {
  display: grid;
  gap: 10px;
  justify-items: end;
}

.booking-hero__eyebrow,
.booking-panel__section header p,
.booking-summary > p,
.booking-success__eyebrow {
  color: rgba(16, 20, 18, 0.42);
  font-size: 11px;
  letter-spacing: 0.32em;
  text-transform: uppercase;
}

.booking-hero h1 {
  margin-top: 18px;
  font-family: var(--font-serif);
  font-size: clamp(44px, 6vw, 86px);
  font-weight: 400;
  letter-spacing: 0.08em;
  line-height: 1;
}

.booking-hero__description {
  max-width: 42rem;
  margin-top: 26px;
  color: rgba(16, 20, 18, 0.66);
  font-family: var(--font-serif);
  font-size: clamp(16px, 1.3vw, 21px);
  letter-spacing: 0.04em;
  line-height: 1.85;
}

.booking-hero__back {
  color: var(--deep-green);
  font-size: 11px;
  letter-spacing: 0.28em;
  text-transform: uppercase;
}

.booking-notes,
.booking-flow {
  max-width: 1320px;
  margin: 0 auto;
  padding-inline: clamp(20px, 3vw, 48px);
}

.booking-notes {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1px;
  margin-bottom: clamp(34px, 5vw, 58px);
  border: 1px solid rgba(16, 20, 18, 0.08);
  background: rgba(16, 20, 18, 0.08);
}

.booking-notes article {
  display: grid;
  gap: 12px;
  padding: 20px;
  background: rgba(250, 247, 240, 0.92);
}

.booking-notes small {
  color: rgba(16, 20, 18, 0.42);
  font-size: 11px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
}

.booking-notes p {
  color: rgba(16, 20, 18, 0.62);
  font-size: 14px;
  line-height: 1.8;
}

.booking-flow {
  padding-bottom: clamp(86px, 11vw, 150px);
}

.booking-steps {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1px;
  list-style: none;
  margin: 0 0 clamp(34px, 5vw, 60px);
  padding: 1px;
  border: 1px solid rgba(16, 20, 18, 0.08);
  background: rgba(16, 20, 18, 0.08);
}

.booking-steps li {
  padding: 16px;
  background: rgba(250, 247, 240, 0.94);
  color: rgba(16, 20, 18, 0.42);
  font-size: 11px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
}

.booking-steps li.is-active,
.booking-steps li.is-done {
  color: var(--deep-green);
  background: rgba(239, 244, 240, 0.96);
}

.booking-panel {
  display: grid;
  gap: clamp(30px, 5vw, 58px);
}

.booking-panel__section header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 18px;
  padding-bottom: 18px;
  margin-bottom: 22px;
  border-bottom: 1px solid rgba(16, 20, 18, 0.1);
}

.booking-panel__section h2 {
  font-family: var(--font-serif);
  font-size: clamp(24px, 2.6vw, 38px);
  font-weight: 400;
  letter-spacing: 0.04em;
}

.booking-options,
.slot-options,
.payment-options {
  display: grid;
  gap: 1px;
  border: 1px solid rgba(16, 20, 18, 0.08);
  background: rgba(16, 20, 18, 0.08);
}

.booking-option,
.slot-option,
.payment-option {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 18px;
  align-items: center;
  padding: 18px;
  cursor: pointer;
  background: rgba(250, 247, 240, 0.94);
  transition: background 180ms ease, color 180ms ease;
}

.booking-option.is-selected,
.slot-option.is-selected,
.payment-option.is-selected {
  background: rgba(232, 239, 233, 0.96);
  color: var(--deep-green);
}

.slot-option.is-disabled {
  cursor: not-allowed;
  color: rgba(16, 20, 18, 0.34);
  background: rgba(244, 239, 230, 0.62);
}

.booking-option input,
.slot-option input,
.payment-option input {
  accent-color: var(--deep-green);
}

.booking-option strong,
.slot-option strong,
.payment-option strong {
  display: block;
  font-family: var(--font-serif);
  font-size: 20px;
  font-weight: 400;
  letter-spacing: 0.05em;
}

.booking-option small,
.booking-option em,
.slot-option span,
.slot-option small,
.payment-option small,
.payment-option em {
  color: rgba(16, 20, 18, 0.54);
  font-size: 12px;
  font-style: normal;
  letter-spacing: 0.06em;
  line-height: 1.7;
}

.slot-options {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.slot-option {
  grid-template-columns: auto 1fr;
  align-content: start;
}

.slot-option strong,
.slot-option small {
  grid-column: 2;
}

.visitor-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1px;
  border: 1px solid rgba(16, 20, 18, 0.08);
  background: rgba(16, 20, 18, 0.08);
}

.spot-select {
  display: grid;
  gap: 12px;
  padding: 18px;
  border: 1px solid rgba(16, 20, 18, 0.08);
  background: rgba(250, 247, 240, 0.94);
}

.spot-select span {
  color: rgba(16, 20, 18, 0.42);
  font-size: 11px;
  letter-spacing: 0.28em;
}

.spot-select select {
  width: 100%;
  min-width: 0;
  border: 0;
  border-bottom: 1px solid rgba(16, 20, 18, 0.14);
  border-radius: 0;
  background: transparent;
  color: var(--ink);
  font-size: 15px;
  outline: none;
}

.visitor-form label {
  display: grid;
  gap: 12px;
  padding: 18px;
  background: rgba(250, 247, 240, 0.94);
}

.visitor-form label.has-warning input {
  border-bottom-color: rgba(138, 106, 79, 0.46);
}

.visitor-form label.has-warning span {
  color: rgba(138, 106, 79, 0.84);
}

.visitor-form__hint {
  margin-top: 14px;
  color: rgba(16, 20, 18, 0.48);
  font-size: 12px;
  letter-spacing: 0.06em;
  line-height: 1.8;
}

.visitor-form__hint--warning {
  color: rgba(138, 106, 79, 0.86);
}

.visitor-form span {
  color: rgba(16, 20, 18, 0.42);
  font-size: 11px;
  letter-spacing: 0.28em;
}

.visitor-form input {
  width: 100%;
  min-width: 0;
  border: 0;
  border-bottom: 1px solid rgba(16, 20, 18, 0.14);
  border-radius: 0;
  background: transparent;
  color: var(--ink);
  font-size: 15px;
  outline: none;
}

.booking-summary {
  padding: 24px;
  border: 1px solid rgba(16, 20, 18, 0.1);
  background: rgba(244, 239, 230, 0.55);
}

.booking-summary dl,
.booking-success dl {
  display: grid;
  gap: 12px;
  margin: 18px 0 0;
}

.booking-summary div,
.booking-success div {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(16, 20, 18, 0.08);
}

.booking-summary dt,
.booking-success dt {
  color: rgba(16, 20, 18, 0.44);
  font-size: 11px;
  letter-spacing: 0.24em;
}

.booking-summary dd,
.booking-success dd {
  margin: 0;
  text-align: right;
  color: rgba(16, 20, 18, 0.7);
  font-family: var(--font-serif);
  letter-spacing: 0.04em;
}

.booking-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.booking-primary,
.booking-secondary {
  justify-self: start;
  border: 1px solid rgba(31, 58, 52, 0.22);
  background: rgba(31, 58, 52, 0.06);
  color: var(--deep-green);
  cursor: pointer;
  padding: 12px 20px;
  font-size: 12px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  transition: opacity 180ms ease, background 180ms ease, transform 180ms ease;
}

.booking-secondary {
  background: transparent;
  color: rgba(16, 20, 18, 0.58);
}

.booking-primary:hover,
.booking-secondary:hover,
.booking-primary:focus-visible,
.booking-secondary:focus-visible {
  transform: translateY(-1px);
  outline: none;
}

.booking-primary:disabled {
  cursor: not-allowed;
  opacity: 0.42;
}

.booking-success {
  max-width: 760px;
  padding: clamp(34px, 5vw, 58px);
  border: 1px solid rgba(16, 20, 18, 0.1);
  background: rgba(250, 247, 240, 0.94);
}

.booking-success h2 {
  margin-top: 14px;
  font-family: var(--font-serif);
  font-size: clamp(34px, 4vw, 56px);
  font-weight: 400;
  letter-spacing: 0.06em;
}

.booking-success__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 28px;
}

.booking-primary--link {
  display: inline-flex;
}

@media (max-width: 820px) {
  .booking-notes {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .booking-hero__layout,
  .booking-steps,
  .slot-options,
  .visitor-form {
    grid-template-columns: 1fr;
  }

  .booking-hero__back {
    justify-self: start;
  }
}

@media (max-width: 640px) {
  .booking-hero,
  .booking-notes,
  .booking-flow {
    padding-inline: 18px;
  }

  .booking-notes,
  .booking-option,
  .slot-option,
  .payment-option,
  .booking-summary div,
  .booking-success div {
    display: grid;
    grid-template-columns: 1fr;
  }

  .booking-summary dd,
  .booking-success dd {
    text-align: left;
  }
}

</style>
