<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import PageCrumbs from '../components/common/PageCrumbs.vue'
import SiteFooter from '../components/layout/SiteFooter.vue'
import type { BookingOrder, BookingOrderStatus } from '../data/mockOrders'
import { t } from '../i18n/site'
import { fetchOrders, updateOrderStatus } from '../services/api'
import { ensureCatalog, scenicSpots } from '../stores/catalog'
import {
  localizeOrderSpotName,
  localizeOrderStatus,
  localizePaymentStatus,
  localizeTicketName,
  localizeVisitorName,
} from '../utils/localization'

const orders = ref<BookingOrder[]>([])
const selectedStatus = ref<'全部' | BookingOrderStatus>('全部')
const apiError = ref('')
const statusOptions: Array<'全部' | BookingOrderStatus> = ['全部', '待出行', '已完成', '已取消']
const filteredOrders = computed(() =>
  selectedStatus.value === '全部'
    ? orders.value
    : orders.value.filter((order) => order.status === selectedStatus.value),
)

const refreshOrders = async () => {
  try {
    apiError.value = ''
    orders.value = await fetchOrders()
  } catch (error) {
    apiError.value = error instanceof Error ? error.message : t('orders.loadError')
  }
}

const cancelOrder = async (order: BookingOrder) => {
  if (order.status !== '待出行') return

  if (!window.confirm(t('orders.cancelConfirmMessage'))) {
    return
  }

  try {
    await updateOrderStatus(order.id, '已取消')
    await refreshOrders()
  } catch (error) {
    apiError.value = error instanceof Error ? error.message : t('orders.cancelError')
  }
}

const getSpotIdByName = (spotName: string) =>
  scenicSpots.value.find((spot) => spot.nameZh === spotName)?.id ??
  scenicSpots.value[0]?.id ??
  ''

const getPaymentLabel = (order: BookingOrder) => {
  if (order.paymentMethod === 'alipay') return t('booking.payment.alipay')
  if (order.paymentMethod === 'wechat') return t('booking.payment.wechat')
  if (order.paymentMethod === 'unionpay') return t('booking.payment.unionpay')
  return t('booking.payment.free')
}

onMounted(() => {
  void ensureCatalog()
  void refreshOrders()
})
</script>

<template>
  <div class="page-shell">
    <main id="main-content" class="orders-page" tabindex="-1">
      <section class="orders-hero" aria-labelledby="orders-title" data-reveal>
        <PageCrumbs
          :items="[
            { label: t('page.home'), to: '/' },
            { label: t('page.orders') },
          ]"
        />

        <div class="orders-hero__meta">
          <span>{{ t('orders.title') }}</span>
          <span>{{ t('orders.metaCount', { count: orders.length.toString().padStart(2, '0') }) }}</span>
        </div>

        <p class="orders-hero__eyebrow">{{ t('orders.eyebrow') }}</p>
        <h1 id="orders-title">{{ t('orders.title') }}</h1>
        <p class="orders-hero__description">{{ t('orders.heroDescription') }}</p>

        <div class="orders-hero__actions">
          <RouterLink to="/scenic-spots">{{ t('notfound.reservations') }}</RouterLink>
          <RouterLink to="/visit-guide">{{ t('page.visitGuide') }}</RouterLink>
        </div>
      </section>

      <section class="orders-filter" :aria-label="t('orders.filterAria')" data-reveal>
        <button
          v-for="status in statusOptions"
          :key="status"
          type="button"
          :class="{ 'is-active': selectedStatus === status }"
          @click="selectedStatus = status"
        >
          {{
            status === '全部'
              ? t('orders.filter.all')
              : status === '待出行'
                ? t('orders.filter.pending')
                : status === '已完成'
                  ? t('orders.filter.done')
                  : t('orders.filter.canceled')
          }}
        </button>
      </section>

      <section class="orders-list" :aria-label="t('orders.listAria')" data-reveal>
        <div v-if="apiError" class="orders-empty">
          <p>{{ apiError }}</p>
        </div>

        <article v-for="order in filteredOrders" :key="order.id" class="order-card">
          <div class="order-card__main">
            <p class="order-card__id">{{ order.id }}</p>
            <h2>{{ localizeOrderSpotName(order.spotName, scenicSpots) }}</h2>
            <p>{{ order.visitDate }} · {{ order.timeRange }}</p>
          </div>

          <dl class="order-card__details">
            <div>
              <dt>{{ t('orders.field.visitor') }}</dt>
              <dd>{{ order.visitors.map(localizeVisitorName).join(' / ') }}</dd>
            </div>
            <div v-if="order.ticketName">
              <dt>{{ t('orders.field.ticket') }}</dt>
              <dd>{{ localizeTicketName({ name: order.ticketName, description: '', availableFor: '' }) }}</dd>
            </div>
            <div>
              <dt>{{ t('orders.payment') }}</dt>
              <dd>
                {{ getPaymentLabel(order) }}
                <template v-if="typeof order.amount === 'number' && order.amount > 0"> · ¥{{ order.amount }}</template>
                <template v-if="order.paymentStatus"> · {{ localizePaymentStatus(order.paymentStatus) }}</template>
              </dd>
            </div>
            <div>
              <dt>{{ t('orders.field.status') }}</dt>
              <dd>
                <span class="order-card__status" :class="`is-${order.status}`">{{ localizeOrderStatus(order.status) }}</span>
              </dd>
            </div>
            <div>
              <dt>{{ t('orders.field.voucher') }}</dt>
              <dd>{{ order.qrCodeText }}</dd>
            </div>
            <div>
              <dt>{{ t('orders.field.created') }}</dt>
              <dd>{{ order.createdAt }}</dd>
            </div>
          </dl>

          <aside class="order-card__voucher" :aria-label="t('orders.voucher')">
            <span class="voucher-pattern" aria-hidden="true"></span>
            <span class="voucher-copy">
              <small>{{ t('orders.voucher') }}</small>
              <strong>{{ order.qrCodeText }}</strong>
            </span>
          </aside>

          <div class="order-card__actions">
            <RouterLink :to="`/scenic-spots/${getSpotIdByName(order.spotName)}`">{{ t('common.viewSpotDetail') }}</RouterLink>
            <RouterLink :to="{ path: '/booking', query: { spot: getSpotIdByName(order.spotName) } }">{{ t('orders.bookAgain') }}</RouterLink>
            <button
              v-if="order.status === '待出行'"
              type="button"
              @click="cancelOrder(order)"
            >
              {{ t('orders.cancel') }}
            </button>
          </div>
        </article>

        <div v-if="filteredOrders.length === 0" class="orders-empty">
          <p>{{ t('orders.empty') }}</p>
          <RouterLink to="/scenic-spots">{{ t('common.backToReservations') }}</RouterLink>
        </div>

        <RouterLink to="/scenic-spots" class="orders-list__back">{{ t('common.backToReservations') }}</RouterLink>
      </section>
    </main>
    <SiteFooter />
  </div>
</template>

<style scoped>
.orders-page {
  background: var(--paper-light);
  color: var(--ink);
}

.orders-hero,
.orders-list {
  max-width: 1320px;
  margin: 0 auto;
  padding-inline: clamp(20px, 3vw, 48px);
}

.orders-hero {
  padding-top: clamp(80px, 12vw, 152px);
  padding-bottom: clamp(54px, 8vw, 98px);
}

.orders-hero__meta {
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

.orders-hero__eyebrow {
  color: rgba(16, 20, 18, 0.42);
  font-size: 11px;
  letter-spacing: 0.32em;
  text-transform: uppercase;
}

.orders-hero h1 {
  margin-top: 18px;
  font-family: var(--font-serif);
  font-size: clamp(44px, 6vw, 86px);
  font-weight: 400;
  letter-spacing: 0.08em;
  line-height: 1;
}

.orders-hero__description {
  max-width: 38rem;
  margin-top: 28px;
  color: rgba(16, 20, 18, 0.66);
  font-family: var(--font-serif);
  font-size: clamp(16px, 1.3vw, 21px);
  letter-spacing: 0.04em;
  line-height: 1.85;
}

.orders-hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 26px;
}

.orders-hero__actions a {
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

.orders-hero__actions a:hover,
.orders-hero__actions a:focus-visible {
  color: var(--deep-green);
  border-color: rgba(31, 58, 52, 0.2);
  transform: translateX(2px);
  outline: none;
}

.orders-filter,
.orders-list {
  max-width: 1320px;
  margin: 0 auto;
  padding-inline: clamp(20px, 3vw, 48px);
}

.orders-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 1px;
  padding-bottom: clamp(28px, 4vw, 48px);
}

.orders-filter button {
  border: 1px solid rgba(16, 20, 18, 0.09);
  background: rgba(250, 247, 240, 0.84);
  color: rgba(16, 20, 18, 0.54);
  cursor: pointer;
  padding: 10px 14px;
  font-size: 11px;
  letter-spacing: 0.24em;
  transition: color 180ms ease, background 180ms ease;
}

.orders-filter button.is-active,
.orders-filter button:hover,
.orders-filter button:focus-visible {
  background: rgba(232, 239, 233, 0.92);
  color: var(--deep-green);
  outline: none;
}

.orders-list {
  display: grid;
  gap: 18px;
  padding-bottom: clamp(86px, 11vw, 150px);
}

.order-card {
  display: grid;
  grid-template-columns: minmax(16rem, 0.42fr) minmax(0, 1fr);
  gap: clamp(24px, 5vw, 72px);
  padding: clamp(24px, 3vw, 40px);
  border: 1px solid rgba(16, 20, 18, 0.1);
  background: rgba(250, 247, 240, 0.88);
}

.order-card__id {
  color: rgba(16, 20, 18, 0.42);
  font-size: 11px;
  letter-spacing: 0.28em;
  text-transform: uppercase;
}

.order-card h2 {
  margin-top: 14px;
  font-family: var(--font-serif);
  font-size: clamp(26px, 3vw, 42px);
  font-weight: 400;
  letter-spacing: 0.05em;
}

.order-card__main > p:last-child {
  margin-top: 16px;
  color: rgba(16, 20, 18, 0.54);
  font-size: 13px;
  letter-spacing: 0.12em;
}

.order-card__details {
  display: grid;
  gap: 0;
  margin: 0;
  border-top: 1px solid rgba(16, 20, 18, 0.09);
}

.order-card__status {
  color: var(--deep-green);
}

.order-card__status.is-已完成 {
  color: rgba(16, 20, 18, 0.54);
}

.order-card__status.is-已取消 {
  color: rgba(138, 106, 79, 0.76);
}

.order-card__actions {
  grid-column: 1 / -1;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: flex-end;
}

.order-card__voucher {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: 82px minmax(0, 1fr);
  gap: 18px;
  align-items: center;
  padding: 16px;
  border: 1px solid rgba(16, 20, 18, 0.08);
  background: rgba(244, 239, 230, 0.54);
}

.voucher-pattern {
  width: 72px;
  aspect-ratio: 1;
  border: 1px solid rgba(16, 20, 18, 0.12);
  background:
    linear-gradient(90deg, rgba(31, 58, 52, 0.72) 12px, transparent 12px 18px, rgba(31, 58, 52, 0.72) 18px 24px, transparent 24px),
    linear-gradient(0deg, transparent 10px, rgba(31, 58, 52, 0.2) 10px 14px, transparent 14px 22px, rgba(31, 58, 52, 0.52) 22px 28px, transparent 28px),
    rgba(250, 247, 240, 0.92);
  background-size: 24px 24px, 28px 28px, auto;
}

.voucher-copy {
  display: grid;
  gap: 6px;
  min-width: 0;
}

.voucher-copy small {
  color: rgba(16, 20, 18, 0.42);
  font-size: 11px;
  letter-spacing: 0.24em;
}

.voucher-copy strong {
  overflow-wrap: anywhere;
  color: rgba(16, 20, 18, 0.7);
  font-family: var(--font-serif);
  font-weight: 400;
  letter-spacing: 0.05em;
}

.order-card__actions a,
.order-card__actions button,
.orders-empty a {
  border: 0;
  background: transparent;
  color: var(--deep-green);
  cursor: pointer;
  font-size: 11px;
  letter-spacing: 0.26em;
  text-transform: uppercase;
}

.orders-empty {
  display: grid;
  gap: 14px;
  padding: 34px 0;
  border-top: 1px solid rgba(16, 20, 18, 0.09);
  color: rgba(16, 20, 18, 0.56);
}

.order-card__details div {
  display: grid;
  grid-template-columns: minmax(6rem, 0.25fr) minmax(0, 1fr);
  gap: 18px;
  padding: 13px 0;
  border-bottom: 1px solid rgba(16, 20, 18, 0.09);
}

.order-card dt {
  color: rgba(16, 20, 18, 0.42);
  font-size: 11px;
  letter-spacing: 0.24em;
}

.order-card dd {
  margin: 0;
  color: rgba(16, 20, 18, 0.68);
  font-family: var(--font-serif);
  letter-spacing: 0.04em;
}

.orders-list__back {
  justify-self: start;
  margin-top: 26px;
  color: var(--deep-green);
  font-size: 11px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
}

@media (max-width: 760px) {
  .orders-hero,
  .orders-filter,
  .orders-list {
    padding-inline: 18px;
  }

  .order-card,
  .order-card__details div {
    grid-template-columns: 1fr;
    gap: 10px;
  }
}
</style>
