<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import PageCrumbs from '../components/common/PageCrumbs.vue'
import SiteFooter from '../components/layout/SiteFooter.vue'
import { useSmartBack } from '../composables/useSmartBack'
import type {
  BookingAppealStatus,
  BookingCompanion,
  BookingInvoiceStatus,
  BookingOrder,
  BookingOrderStatus,
  BookingRefundStatus,
  BookingVoucherChannel,
} from '../data/mockOrders'
import type { LocalizedText } from '../i18n/site'
import { pickLocalized, t } from '../i18n/site'
import { fetchOrders, updateOrderStatus } from '../services/api'
import { ensureCatalog, scenicSpots } from '../stores/catalog'
import {
  localizeOrderSpotName,
  localizeOrderStatus,
  localizePaymentStatus,
  localizeTicketName,
  localizeVisitorName,
} from '../utils/localization'

const text = (zh: string, en: string, ja: string, ko: string): LocalizedText => ({
  'zh-CN': zh,
  'en-US': en,
  'ja-JP': ja,
  'ko-KR': ko,
})

const orders = ref<BookingOrder[]>([])
const selectedStatus = ref<'全部' | BookingOrderStatus>('全部')
const apiError = ref('')
const statusOptions: Array<'全部' | BookingOrderStatus> = ['全部', '待出行', '已完成', '已取消']
const serviceNotes = ref<Record<string, string>>({})
const deliveredOverrides = ref<Record<string, BookingVoucherChannel[]>>({})
const invoiceOverrides = ref<Record<string, { status: BookingInvoiceStatus; summary: string }>>({})
const appealOverrides = ref<Record<string, { status: BookingAppealStatus; summary: string }>>({})
const { goBack } = useSmartBack('/scenic-spots')

const filteredOrders = computed(() =>
  selectedStatus.value === '全部'
    ? orders.value
    : orders.value.filter((order) => order.status === selectedStatus.value),
)

const overviewCards = computed(() => {
  const pendingCount = orders.value.filter((order) => order.status === '待出行').length
  const refundingCount = orders.value.filter((order) => getRefundStatus(order) === '退款中').length
  const deliveredCount = orders.value.filter((order) => getVoucherChannels(order).length >= 2).length

  return [
    {
      id: 'pending',
      label: text('待出行订单', 'Upcoming Orders', '今後の予約', '예정 주문'),
      value: String(pendingCount).padStart(2, '0'),
      detail: text('集中查看可核验凭证、同行人和入园时间。', 'Keep vouchers, companions and entry windows ready.', '入場証明、同行者、入場時間をまとめて確認できます。', '입장 증빙, 동행인, 입장 시간을 한곳에서 확인합니다.'),
    },
    {
      id: 'delivered',
      label: text('已送达凭证', 'Delivered Vouchers', '送信済み証明', '전달된 바우처'),
      value: String(deliveredCount).padStart(2, '0'),
      detail: text('短信、邮箱与钱包卡包可按订单随时补发。', 'SMS, email and wallet passes can be reissued any time.', 'SMS、メール、ウォレットは注文ごとに再送できます。', '문자, 이메일, 지갑 패스는 주문별로 다시 보낼 수 있습니다.'),
    },
    {
      id: 'refund',
      label: text('退款处理中', 'Refunds in Progress', '返金処理中', '환불 진행 중'),
      value: String(refundingCount).padStart(2, '0'),
      detail: text('取消原因、退款进度和申诉状态在订单页同步更新。', 'Cancellation, refund progress and appeals stay in sync here.', '取消理由、返金進捗、申立状況をここで確認できます。', '취소 사유, 환불 진행, 이의 제기 상태를 여기서 확인할 수 있습니다.'),
    },
  ]
})

const refreshOrders = async () => {
  try {
    apiError.value = ''
    orders.value = await fetchOrders()
  } catch (error) {
    apiError.value = error instanceof Error ? error.message : t('orders.loadError')
  }
}

const setServiceNote = (orderId: string, message: string) => {
  serviceNotes.value = {
    ...serviceNotes.value,
    [orderId]: message,
  }
}

const pushDeliveredChannel = (orderId: string, channel: BookingVoucherChannel) => {
  const current = deliveredOverrides.value[orderId] ?? []
  if (current.includes(channel)) return
  deliveredOverrides.value = {
    ...deliveredOverrides.value,
    [orderId]: [...current, channel],
  }
}

const cancelOrder = async (order: BookingOrder) => {
  if (order.status !== '待出行') return

  const promptText = pickLocalized(
    text(
      '请输入取消原因，系统将同步更新退款与申诉服务。',
      'Enter a cancellation reason to update refund and appeal services.',
      '取消理由を入力すると返金・申立情報も更新されます。',
      '취소 사유를 입력하면 환불 및 이의 제기 정보도 함께 갱신됩니다.',
    ),
  )
  const reason = window.prompt(promptText, order.cancellationReason ?? '')
  if (reason === null) return

  if (!window.confirm(t('orders.cancelConfirmMessage'))) {
    return
  }

  try {
    await updateOrderStatus(order.id, '已取消', reason.trim() || undefined)
    await refreshOrders()
    setServiceNote(order.id, '已受理取消申请，退款与凭证状态已同步更新。')
  } catch (error) {
    apiError.value = error instanceof Error ? error.message : t('orders.cancelError')
  }
}

const getSpotIdByName = (spotName: string) =>
  scenicSpots.value.find((spot) => spot.nameZh === spotName || spot.nameEn === spotName)?.id ?? null

const getSpotDetailTarget = (spotName: string): RouteLocationRaw => {
  const spotId = getSpotIdByName(spotName)
  return spotId ? { path: `/scenic-spots/${spotId}` } : { path: '/scenic-spots' }
}

const getBookAgainTarget = (spotName: string): RouteLocationRaw => {
  const spotId = getSpotIdByName(spotName)
  return spotId ? { path: '/booking', query: { spot: spotId } } : { path: '/booking' }
}

const getPaymentLabel = (order: BookingOrder) => {
  if (order.paymentMethod === 'alipay') return t('booking.payment.alipay')
  if (order.paymentMethod === 'wechat') return t('booking.payment.wechat')
  if (order.paymentMethod === 'unionpay') return t('booking.payment.unionpay')
  return t('booking.payment.free')
}

const getVoucherChannels = (order: BookingOrder) =>
  Array.from(new Set([...(order.voucherChannels ?? []), ...(deliveredOverrides.value[order.id] ?? [])]))

const getCompanions = (order: BookingOrder): BookingCompanion[] =>
  order.companions?.length
    ? order.companions
    : order.visitors.map((name) => ({
        name,
        credentialStatus: '已核验',
        idType: order.idType ?? '身份证',
      }))

const getRefundStatus = (order: BookingOrder): BookingRefundStatus =>
  order.refundStatus ?? (order.amount && order.amount > 0 ? '待处理' : '无需退款')

const getInvoiceState = (order: BookingOrder) => invoiceOverrides.value[order.id] ?? null
const getAppealState = (order: BookingOrder) => appealOverrides.value[order.id] ?? null

const getInvoiceStatus = (order: BookingOrder): BookingInvoiceStatus =>
  getInvoiceState(order)?.status ?? order.invoiceStatus ?? '可申请'

const getAppealStatus = (order: BookingOrder): BookingAppealStatus =>
  getAppealState(order)?.status ?? order.appealStatus ?? '可发起'

const getAppealSummary = (order: BookingOrder) =>
  getAppealState(order)?.summary ??
  order.appealSummary ??
  '可发起订单申诉，服务专席将通过短信或邮件反馈处理结果。'

const localizeChannel = (channel: BookingVoucherChannel) =>
  pickLocalized(
    channel === 'sms'
      ? text('短信', 'SMS', 'SMS', '문자')
      : channel === 'email'
        ? text('邮箱', 'Email', 'メール', '이메일')
        : channel === 'appleWallet'
          ? text('Apple Wallet', 'Apple Wallet', 'Apple Wallet', 'Apple Wallet')
          : text('Google Wallet', 'Google Wallet', 'Google Wallet', 'Google Wallet'),
  )

const localizeRefundStatus = (status: BookingRefundStatus) =>
  pickLocalized(
    status === '无需退款'
      ? text('无需退款', 'No Refund Needed', '返金不要', '환불 불필요')
      : status === '待处理'
        ? text('待处理', 'Pending Review', '確認待ち', '검토 대기')
        : status === '退款中'
          ? text('退款中', 'Refund in Progress', '返金処理中', '환불 진행 중')
          : text('已退款', 'Refunded', '返金済み', '환불 완료'),
  )

const localizeInvoiceStatus = (status: BookingInvoiceStatus) =>
  pickLocalized(
    status === '可申请'
      ? text('可申请', 'Available to Request', '申請可能', '신청 가능')
      : status === '开票中'
        ? text('开票中', 'Issuing', '発行中', '발행 중')
        : text('已开具', 'Issued', '発行済み', '발행 완료'),
  )

const localizeAppealStatus = (status: BookingAppealStatus) =>
  pickLocalized(
    status === '可发起'
      ? text('可发起', 'Ready to Submit', '申立可能', '접수 가능')
      : status === '处理中'
        ? text('处理中', 'In Review', '対応中', '처리 중')
        : text('已回复', 'Responded', '返信済み', '답변 완료'),
  )

const localizeCredentialStatus = (status: BookingCompanion['credentialStatus']) =>
  pickLocalized(
    status === '已核验'
      ? text('已核验', 'Verified', '確認済み', '확인 완료')
      : text('待补充', 'Needs Update', '要補足', '추가 필요'),
  )

const localizeIdType = (idType?: BookingCompanion['idType']) =>
  pickLocalized(
    idType === '护照'
      ? text('护照', 'Passport', 'パスポート', '여권')
      : text('身份证', 'ID Card', '身分証', '신분증'),
  )

const downloadBlob = (filename: string, content: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

const downloadQr = (order: BookingOrder) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="720" viewBox="0 0 720 720">
  <rect width="720" height="720" fill="#f6f2e9"/>
  <rect x="56" y="56" width="608" height="608" fill="none" stroke="#1f3a34" stroke-width="2"/>
  <rect x="108" y="108" width="120" height="120" fill="#1f3a34"/>
  <rect x="492" y="108" width="120" height="120" fill="#1f3a34"/>
  <rect x="108" y="492" width="120" height="120" fill="#1f3a34"/>
  <g fill="#1f3a34" opacity="0.92">
    <rect x="282" y="126" width="48" height="48"/><rect x="348" y="126" width="36" height="36"/>
    <rect x="282" y="192" width="36" height="36"/><rect x="348" y="204" width="60" height="24"/>
    <rect x="264" y="282" width="72" height="24"/><rect x="372" y="282" width="24" height="72"/>
    <rect x="258" y="354" width="120" height="24"/><rect x="420" y="354" width="84" height="24"/>
    <rect x="258" y="426" width="24" height="96"/><rect x="318" y="444" width="108" height="24"/>
    <rect x="462" y="438" width="66" height="66"/><rect x="552" y="444" width="30" height="120"/>
  </g>
  <text x="108" y="620" font-family="Georgia, serif" font-size="28" fill="#1f3a34">${order.qrCodeText}</text>
  <text x="108" y="658" font-family="Georgia, serif" font-size="20" fill="#5e655f">${order.spotName} · ${order.visitDate} · ${order.timeRange}</text>
</svg>`
  downloadBlob(`${order.id}-voucher.svg`, svg, 'image/svg+xml')
  setServiceNote(order.id, '二维码凭证已下载，可用于现场核验或离线保存。')
}

const downloadReceipt = (order: BookingOrder) => {
  const lines = [
    `订单号: ${order.id}`,
    `景点: ${order.spotName}`,
    `日期: ${order.visitDate} ${order.timeRange}`,
    `票种: ${order.ticketName ?? '现场登记'}`,
    `金额: ¥${order.amount ?? 0}`,
    `支付方式: ${getPaymentLabel(order)}`,
    `支付状态: ${localizePaymentStatus(order.paymentStatus) || '—'}`,
    `收据编号: ${order.receiptCode ?? `RCPT-${order.id}`}`,
    `联系人: ${order.contactPhone ?? '—'} / ${order.contactEmail ?? '—'}`,
  ].join('\n')
  downloadBlob(`${order.id}-receipt.txt`, lines, 'text/plain;charset=utf-8')
  setServiceNote(order.id, '收据文件已生成，可用于报销或留存。')
}

const downloadWalletPass = (order: BookingOrder, provider: 'appleWallet' | 'googleWallet') => {
  const payload = {
    provider,
    orderId: order.id,
    voucher: order.qrCodeText,
    scenicSpot: order.spotName,
    visitDate: order.visitDate,
    timeRange: order.timeRange,
    contact: {
      phone: order.contactPhone,
      email: order.contactEmail,
    },
  }
  downloadBlob(
    `${order.id}-${provider}.json`,
    JSON.stringify(payload, null, 2),
    'application/json;charset=utf-8',
  )
  pushDeliveredChannel(order.id, provider)
  setServiceNote(
    order.id,
    provider === 'appleWallet'
      ? 'Apple Wallet 卡包文件已生成。'
      : 'Google Wallet 卡包文件已生成。',
  )
}

const resendVoucher = (order: BookingOrder, channel: 'sms' | 'email') => {
  if (channel === 'email' && !order.contactEmail) {
    setServiceNote(order.id, '当前订单未绑定邮箱，建议先在新订单中补充联系邮箱。')
    return
  }
  if (channel === 'sms' && !order.contactPhone) {
    setServiceNote(order.id, '当前订单缺少手机号，暂时无法补发短信凭证。')
    return
  }
  pushDeliveredChannel(order.id, channel)
  setServiceNote(
    order.id,
    channel === 'email'
      ? `电子凭证已补发至 ${order.contactEmail}。`
      : `短信凭证已补发至 ${order.contactPhone}。`,
  )
}

const requestInvoice = (order: BookingOrder) => {
  if (getInvoiceStatus(order) === '已开具') {
    downloadReceipt(order)
    return
  }

  invoiceOverrides.value = {
    ...invoiceOverrides.value,
    [order.id]: {
      status: '开票中',
      summary: '发票申请已提交，电子票据将在 30 分钟内发送至联系邮箱。',
    },
  }
  setServiceNote(order.id, '发票申请已提交，系统正在生成电子票据。')
}

const startAppeal = (order: BookingOrder) => {
  appealOverrides.value = {
    ...appealOverrides.value,
    [order.id]: {
      status: '处理中',
      summary: '订单申诉已登记，服务专席将在 2 小时内通过短信或邮件回复。',
    },
  }
  setServiceNote(order.id, '订单申诉已创建，后续处理会同步到当前订单。')
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
          <button type="button" @click="goBack">{{ t('common.back') }}</button>
          <RouterLink to="/scenic-spots">{{ t('notfound.reservations') }}</RouterLink>
          <RouterLink to="/visit-guide">{{ t('page.visitGuide') }}</RouterLink>
        </div>
      </section>

      <section class="orders-overview" :aria-label="pickLocalized(text('订单服务概览', 'Order Service Overview', '注文サービス概要', '주문 서비스 개요'))" data-reveal>
        <article v-for="card in overviewCards" :key="card.id">
          <small>{{ pickLocalized(card.label) }}</small>
          <strong>{{ card.value }}</strong>
          <p>{{ pickLocalized(card.detail) }}</p>
        </article>
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
          <header class="order-card__head">
            <div class="order-card__main">
              <p class="order-card__id">{{ order.id }}</p>
              <h2>{{ localizeOrderSpotName(order.spotName, scenicSpots) }}</h2>
              <p>{{ order.visitDate }} · {{ order.timeRange }}</p>
            </div>

            <div class="order-card__badges">
              <span class="order-chip" :class="`is-${order.status}`">{{ localizeOrderStatus(order.status) }}</span>
              <span class="order-chip is-payment">
                {{ getPaymentLabel(order) }}
                <template v-if="typeof order.amount === 'number'"> · ¥{{ order.amount }}</template>
              </span>
              <span class="order-chip is-muted">{{ localizePaymentStatus(order.paymentStatus) || '—' }}</span>
            </div>
          </header>

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
              <dt>{{ t('orders.field.created') }}</dt>
              <dd>{{ order.createdAt }}</dd>
            </div>
          </dl>

          <details class="order-card__services">
            <summary>
              <span>{{ pickLocalized(text('订单服务', 'Order Services', '注文サービス', '주문 서비스')) }}</span>
              <small>{{ pickLocalized(text('凭证、退款、同行人、发票与申诉', 'Vouchers, refunds, companions, invoices and appeals', '証明、返金、同行者、請求書、申立', '바우처, 환불, 동행인, 인보이스, 이의제기')) }}</small>
            </summary>

            <section class="order-card__service-grid">
              <article class="service-card">
              <small>{{ t('orders.voucher') }}</small>
              <h3>{{ order.qrCodeText }}</h3>
              <p>{{ pickLocalized(text('凭证支持短信、邮箱和卡包补发，也可直接下载二维码离线保存。', 'Vouchers can be resent by SMS, email or wallet, and the QR can be downloaded for offline use.', '証明は SMS、メール、ウォレットへ再送でき、QR も保存できます。', '바우처는 문자, 이메일, 지갑으로 재발송할 수 있고 QR도 저장할 수 있습니다.')) }}</p>
              <div class="service-card__chips">
                <span v-for="channel in getVoucherChannels(order)" :key="channel" class="service-chip">{{ localizeChannel(channel) }}</span>
              </div>
              <div class="service-card__actions">
                <button type="button" @click="resendVoucher(order, 'sms')">{{ pickLocalized(text('补发短信', 'Resend SMS', 'SMS再送', '문자 재발송')) }}</button>
                <button type="button" @click="resendVoucher(order, 'email')">{{ pickLocalized(text('补发邮箱', 'Resend Email', 'メール再送', '이메일 재발송')) }}</button>
                <button type="button" @click="downloadQr(order)">{{ pickLocalized(text('下载二维码', 'Download QR', 'QR保存', 'QR 다운로드')) }}</button>
                <button type="button" @click="downloadWalletPass(order, 'appleWallet')">Apple Wallet</button>
                <button type="button" @click="downloadWalletPass(order, 'googleWallet')">Google Wallet</button>
              </div>
              </article>

              <article class="service-card">
              <small>{{ pickLocalized(text('退款与取消', 'Refunds & Cancellation', '返金と取消', '환불 및 취소')) }}</small>
              <h3>{{ localizeRefundStatus(getRefundStatus(order)) }}</h3>
              <p v-if="order.refundProgress">{{ order.refundProgress }}</p>
              <p v-else>{{ pickLocalized(text('当前订单暂无退款动作，可继续保留凭证或按规则办理取消。', 'No active refund action on this order. Keep the voucher or cancel under the ticketing rules.', '現時点では返金処理はありません。証明を保持するか、規則に沿って取消できます。', '현재 환불 진행은 없으며 바우처 보관 또는 규정에 따른 취소가 가능합니다.')) }}</p>
              <dl class="service-card__inline">
                <div v-if="typeof order.refundAmount === 'number' && order.refundAmount > 0">
                  <dt>{{ pickLocalized(text('退款金额', 'Refund Amount', '返金額', '환불 금액')) }}</dt>
                  <dd>¥{{ order.refundAmount }}</dd>
                </div>
                <div v-if="order.cancellationReason">
                  <dt>{{ pickLocalized(text('取消原因', 'Cancellation Reason', '取消理由', '취소 사유')) }}</dt>
                  <dd>{{ order.cancellationReason }}</dd>
                </div>
              </dl>
              </article>

              <article class="service-card">
              <small>{{ pickLocalized(text('同行人与实名', 'Companions & Identity', '同行者と本人確認', '동행인 및 실명')) }}</small>
              <h3>{{ pickLocalized(text('同行人管理', 'Companion Roster', '同行者管理', '동행인 관리')) }}</h3>
              <ul class="service-card__list">
                <li v-for="companion in getCompanions(order)" :key="`${order.id}-${companion.name}`">
                  <div>
                    <strong>{{ localizeVisitorName(companion.name) }}</strong>
                    <span>{{ localizeIdType(companion.idType) }}</span>
                  </div>
                  <em :class="{ 'is-warning': companion.credentialStatus === '待补充' }">
                    {{ localizeCredentialStatus(companion.credentialStatus) }}
                  </em>
                </li>
              </ul>
              </article>

              <article class="service-card">
              <small>{{ pickLocalized(text('发票 / 收据', 'Invoice / Receipt', '請求書 / 領収書', '인보이스 / 영수증')) }}</small>
              <h3>{{ localizeInvoiceStatus(getInvoiceStatus(order)) }}</h3>
              <p>{{ getInvoiceState(order)?.summary || pickLocalized(text('支持个人或企业抬头，已开具订单可直接下载收据留存。', 'Supports personal or business billing. Issued orders can download receipts directly.', '個人・法人宛てに対応し、発行済みはそのまま保存できます。', '개인·기업 발행을 지원하며 발행 완료 주문은 바로 저장할 수 있습니다.')) }}</p>
              <dl class="service-card__inline">
                <div>
                  <dt>{{ pickLocalized(text('抬头', 'Billing Title', '宛名', '청구 제목')) }}</dt>
                  <dd>{{ order.invoiceTitle || '—' }}</dd>
                </div>
                <div>
                  <dt>{{ pickLocalized(text('收据编号', 'Receipt Code', '領収番号', '영수증 번호')) }}</dt>
                  <dd>{{ order.receiptCode || `RCPT-${order.id}` }}</dd>
                </div>
              </dl>
              <div class="service-card__actions">
                <button type="button" @click="requestInvoice(order)">{{ pickLocalized(text('申请发票', 'Request Invoice', '請求書申請', '인보이스 신청')) }}</button>
                <button type="button" @click="downloadReceipt(order)">{{ pickLocalized(text('下载收据', 'Download Receipt', '領収書保存', '영수증 다운로드')) }}</button>
              </div>
              </article>

              <article class="service-card">
              <small>{{ pickLocalized(text('客服与申诉', 'Support & Appeal', 'サポートと申立', '고객지원 및 이의제기')) }}</small>
              <h3>{{ localizeAppealStatus(getAppealStatus(order)) }}</h3>
              <p>{{ getAppealSummary(order) }}</p>
              <dl class="service-card__inline">
                <div>
                  <dt>{{ pickLocalized(text('服务热线', 'Hotline', 'ホットライン', '핫라인')) }}</dt>
                  <dd><a :href="`tel:${order.supportHotline || '12301'}`">{{ order.supportHotline || '12301' }}</a></dd>
                </div>
                <div>
                  <dt>{{ pickLocalized(text('服务邮箱', 'Support Email', 'サポートメール', '지원 이메일')) }}</dt>
                  <dd><a :href="`mailto:${order.supportEmail || 'tickets@hangzhou.example.gov.cn'}`">{{ order.supportEmail || 'tickets@hangzhou.example.gov.cn' }}</a></dd>
                </div>
              </dl>
              <div class="service-card__actions">
                <button type="button" @click="startAppeal(order)">{{ pickLocalized(text('订单申诉', 'Submit Appeal', '注文申立', '주문 이의제기')) }}</button>
              </div>
              </article>
            </section>
          </details>

          <p v-if="serviceNotes[order.id]" class="order-card__note">{{ serviceNotes[order.id] }}</p>

          <div class="order-card__actions">
            <RouterLink :to="getSpotDetailTarget(order.spotName)">{{ t('common.viewSpotDetail') }}</RouterLink>
            <RouterLink :to="getBookAgainTarget(order.spotName)">{{ t('orders.bookAgain') }}</RouterLink>
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
.orders-overview,
.orders-filter,
.orders-list {
  max-width: 1320px;
  margin: 0 auto;
  padding-inline: clamp(20px, 3vw, 48px);
}

.orders-hero {
  padding-top: clamp(80px, 12vw, 152px);
  padding-bottom: clamp(46px, 7vw, 84px);
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

.orders-hero__eyebrow,
.service-card small,
.orders-overview small,
.order-card dt,
.order-card__id {
  color: rgba(16, 20, 18, 0.42);
  font-size: 11px;
  letter-spacing: 0.28em;
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
  max-width: 40rem;
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

.orders-hero__actions a,
.orders-hero__actions button,
.orders-list__back {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border: 1px solid rgba(16, 20, 18, 0.1);
  color: rgba(16, 20, 18, 0.62);
  cursor: pointer;
  font-family: inherit;
  font-size: 11px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  transition: color 220ms ease, border-color 220ms ease, transform 220ms ease;
}

.orders-hero__actions a:hover,
.orders-hero__actions a:focus-visible,
.orders-hero__actions button:hover,
.orders-hero__actions button:focus-visible,
.orders-list__back:hover,
.orders-list__back:focus-visible {
  color: var(--deep-green);
  border-color: rgba(31, 58, 52, 0.2);
  transform: translateX(2px);
  outline: none;
}

.orders-overview {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1px;
  margin-bottom: clamp(26px, 4vw, 42px);
  border: 1px solid rgba(16, 20, 18, 0.08);
  background: rgba(16, 20, 18, 0.08);
}

.orders-overview article {
  display: grid;
  gap: 12px;
  padding: clamp(20px, 2.4vw, 30px);
  background: rgba(250, 247, 240, 0.92);
}

.orders-overview strong {
  color: var(--deep-green);
  font-family: var(--font-serif);
  font-size: clamp(28px, 4vw, 54px);
  font-weight: 400;
  line-height: 1;
}

.orders-overview p,
.service-card p,
.order-card dd,
.orders-empty {
  color: rgba(16, 20, 18, 0.62);
  font-size: 14px;
  line-height: 1.8;
}

.orders-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 1px;
  padding-bottom: clamp(28px, 4vw, 44px);
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
  gap: 12px;
  padding-bottom: clamp(86px, 11vw, 150px);
}

.order-card {
  display: grid;
  gap: 14px;
  padding: clamp(18px, 2vw, 26px);
  border: 1px solid rgba(16, 20, 18, 0.1);
  background: rgba(250, 247, 240, 0.88);
}

.order-card__head {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 14px;
  align-items: center;
}

.order-card h2,
.service-card h3 {
  font-family: var(--font-serif);
  font-weight: 400;
  letter-spacing: 0.05em;
}

.order-card h2 {
  margin-top: 8px;
  font-size: clamp(22px, 2.2vw, 32px);
}

.order-card__main > p:last-child {
  margin-top: 8px;
  color: rgba(16, 20, 18, 0.54);
  font-size: 12px;
  letter-spacing: 0.12em;
}

.order-card__badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
}

.order-chip,
.service-chip {
  display: inline-flex;
  align-items: center;
  padding: 6px 9px;
  border: 1px solid rgba(16, 20, 18, 0.1);
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.order-chip.is-待出行 {
  color: var(--deep-green);
  border-color: rgba(31, 58, 52, 0.18);
}

.order-chip.is-已完成,
.order-chip.is-payment {
  color: rgba(16, 20, 18, 0.62);
}

.order-chip.is-已取消 {
  color: rgba(138, 106, 79, 0.82);
  border-color: rgba(138, 106, 79, 0.18);
}

.order-chip.is-muted {
  color: rgba(16, 20, 18, 0.46);
}

.order-card__details {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1px;
  margin: 0;
  border: 1px solid rgba(16, 20, 18, 0.08);
  background: rgba(16, 20, 18, 0.08);
}

.order-card__details div,
.service-card {
  background: rgba(250, 247, 240, 0.94);
}

.order-card__details div {
  display: grid;
  gap: 8px;
  min-width: 0;
  padding: 14px;
}

.order-card dd {
  margin: 0;
  font-family: var(--font-serif);
  letter-spacing: 0.04em;
  overflow-wrap: anywhere;
}

.order-card__services {
  border: 1px solid rgba(16, 20, 18, 0.08);
  background: rgba(250, 247, 240, 0.72);
}

.order-card__services summary {
  display: grid;
  grid-template-columns: minmax(9rem, 0.32fr) minmax(0, 1fr) auto;
  gap: 14px;
  align-items: center;
  padding: 14px 16px;
  cursor: pointer;
  color: rgba(16, 20, 18, 0.62);
  list-style: none;
}

.order-card__services summary::-webkit-details-marker {
  display: none;
}

.order-card__services summary::after {
  content: '';
  justify-self: end;
  width: 8px;
  height: 8px;
  border-right: 1px solid currentColor;
  border-bottom: 1px solid currentColor;
  transform: rotate(45deg);
  transition: transform 180ms ease;
}

.order-card__services[open] summary::after {
  transform: rotate(225deg);
}

.order-card__services summary span {
  color: var(--deep-green);
  font-family: var(--font-serif);
  font-size: 18px;
  letter-spacing: 0.04em;
}

.order-card__services summary small {
  color: rgba(16, 20, 18, 0.46);
  font-size: 12px;
  line-height: 1.6;
}

.order-card__service-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1px;
  border-top: 1px solid rgba(16, 20, 18, 0.08);
  background: rgba(16, 20, 18, 0.08);
}

.service-card {
  display: grid;
  gap: 12px;
  align-content: start;
  padding: 16px;
}

.service-card h3 {
  font-size: clamp(18px, 1.6vw, 24px);
  line-height: 1.32;
}

.service-card__chips,
.service-card__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.service-card__actions button,
.order-card__actions a,
.order-card__actions button,
.service-card a,
.orders-empty a {
  border: 0;
  background: transparent;
  color: var(--deep-green);
  cursor: pointer;
  padding: 0;
  font-size: 11px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
}

.service-card__actions button:hover,
.service-card__actions button:focus-visible,
.order-card__actions a:hover,
.order-card__actions a:focus-visible,
.order-card__actions button:hover,
.order-card__actions button:focus-visible,
.service-card a:hover,
.service-card a:focus-visible,
.orders-empty a:hover,
.orders-empty a:focus-visible {
  outline: none;
  color: rgba(31, 58, 52, 0.78);
}

.service-card__inline {
  display: grid;
  gap: 10px;
  margin: 0;
}

.service-card__inline div {
  display: grid;
  gap: 6px;
}

.service-card__inline dt,
.service-card__list em,
.service-card__list span {
  color: rgba(16, 20, 18, 0.46);
  font-size: 11px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.service-card__inline dd {
  margin: 0;
  color: rgba(16, 20, 18, 0.7);
  font-family: var(--font-serif);
  letter-spacing: 0.04em;
}

.service-card__list {
  display: grid;
  gap: 10px;
  padding: 0;
  margin: 0;
  list-style: none;
}

.service-card__list li {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(16, 20, 18, 0.08);
}

.service-card__list li:last-child {
  padding-bottom: 0;
  border-bottom: 0;
}

.service-card__list strong {
  display: block;
  color: rgba(16, 20, 18, 0.72);
  font-weight: 400;
}

.service-card__list em.is-warning {
  color: rgba(138, 106, 79, 0.86);
}

.order-card__note {
  padding: 12px 14px;
  border: 1px solid rgba(31, 58, 52, 0.14);
  background: rgba(232, 239, 233, 0.72);
  color: var(--deep-green);
  font-size: 13px;
  line-height: 1.7;
}

.order-card__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  justify-content: flex-end;
}

.orders-empty {
  display: grid;
  gap: 14px;
  padding: 34px 0;
  border-top: 1px solid rgba(16, 20, 18, 0.09);
}

.orders-list__back {
  justify-self: start;
  margin-top: 8px;
}

@media (max-width: 980px) {
  .orders-overview,
  .order-card__details,
  .order-card__service-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .order-card__head {
    grid-template-columns: 1fr;
  }

  .order-card__badges {
    justify-content: flex-start;
  }
}

@media (max-width: 760px) {
  .orders-hero,
  .orders-overview,
  .orders-filter,
  .orders-list {
    padding-inline: 18px;
  }

  .service-card__list li {
    flex-direction: column;
    align-items: flex-start;
  }

  .orders-overview,
  .order-card__details,
  .order-card__service-grid,
  .order-card__services summary {
    grid-template-columns: 1fr;
  }

  .order-card__actions {
    justify-content: flex-start;
  }
}
</style>
