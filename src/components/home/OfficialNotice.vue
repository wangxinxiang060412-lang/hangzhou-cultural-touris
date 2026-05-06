<script setup lang="ts">
import { computed, onMounted } from 'vue'
import type { LocalizedText } from '../../i18n/site'
import { pickLocalized } from '../../i18n/site'
import { bookingSlots, ensureCatalog } from '../../stores/catalog'
import { formatLocalDate } from '../../utils/date'

type NoticeItem = {
  id: string
  tag: LocalizedText
  title: LocalizedText
  detail: LocalizedText
}

type ServiceItem = {
  id: string
  label: LocalizedText
  value: string
  detail: LocalizedText
  href?: string
}

const text = (zh: string, en: string, ja: string, ko: string): LocalizedText => ({
  'zh-CN': zh,
  'en-US': en,
  'ja-JP': ja,
  'ko-KR': ko,
})

const today = formatLocalDate(new Date())

const todayQuota = computed(() =>
  bookingSlots.value
    .filter((slot) => slot.date === today)
    .reduce((total, slot) => total + slot.remaining, 0),
)

const notices: NoticeItem[] = [
  {
    id: 'entry',
    tag: text('入园政策', 'Entry Policy', '入園方針', '입장 정책'),
    title: text('免费开放点位以到访登记和现场秩序为准', 'Free-entry places follow visit registration and on-site control', '無料開放地点は訪問登録と現地運用に準じます', '무료 개방 지점은 방문 등록과 현장 운영을 따릅니다'),
    detail: text('A 级景区不再实行统一入园预约，但演出、游船、展馆、节假日高峰和临时维护仍可能要求分时购票或现场限流。', 'A-level scenic areas no longer use a unified reservation requirement, while shows, boats, museums, holidays and maintenance may still require timed tickets or crowd control.', 'A 級観光地の一律予約要件はありませんが、公演、船便、展示館、祝休日、保守時は時間帯券や入場制限が行われる場合があります。', 'A급 관광지의 통합 예약 요건은 없지만 공연, 선박, 전시관, 공휴일, 점검 시 시간대 티켓 또는 인원 제한이 있을 수 있습니다.'),
  },
  {
    id: 'identity',
    tag: text('实名核验', 'Identity Check', '本人確認', '본인 확인'),
    title: text('购票、优惠和入场凭证需与有效证件一致', 'Tickets, concessions and passes should match valid ID', '券、優待、入場証明は有効な身分証と一致させてください', '티켓, 우대, 입장 증빙은 유효한 신분증과 일치해야 합니다'),
    detail: text('请准确填写姓名、手机号与证件信息；同行多人办理时，部分景点会逐人核验。', 'Enter name, phone and ID accurately. Some sites verify each visitor in multi-person bookings.', '氏名、電話番号、身分証情報を正確に入力してください。複数人の場合、施設により個別確認があります。', '이름, 전화번호, 신분증 정보를 정확히 입력하세요. 여러 명 예약 시 일부 명소는 개별 확인을 합니다.'),
  },
  {
    id: 'traffic',
    tag: text('高峰出行', 'Peak Travel', '混雑時移動', '혼잡 이동'),
    title: text('西湖、灵隐、西溪周边建议优先公共交通', 'Prefer public transport around West Lake, Lingyin and Xixi', '西湖・霊隠・西渓周辺は公共交通を優先', '시후·링인·시시 주변은 대중교통 권장'),
    detail: text('周末、节假日和雨雾天气停车与叫车压力较高，请预留换乘和安检时间。', 'Weekends, holidays, rain and fog increase parking and ride-hailing pressure. Allow transfer and security-check time.', '週末、祝休日、雨霧時は駐車と配車が混雑します。乗換・手荷物検査時間に余裕を持ってください。', '주말, 공휴일, 비·안개 시 주차와 호출 차량 이용이 어려우니 환승과 보안 검색 시간을 확보하세요.'),
  },
]

const services = computed<ServiceItem[]>(() => [
  {
    id: 'quota',
    label: text('今日可预约余量', 'Today Available', '本日残数', '오늘 가능 수량'),
    value: todayQuota.value.toString(),
    detail: text('以页面实时刷新结果为准', 'Based on the latest page refresh', 'ページ更新時点の結果です', '페이지 새로고침 결과 기준'),
  },
  {
    id: 'tourism-hotline',
    label: text('旅游咨询', 'Tourism Hotline', '観光相談', '관광 상담'),
    value: '12301',
    href: 'tel:12301',
    detail: text('旅游咨询、投诉与服务指引', 'Travel advice, complaints and service guidance', '観光相談、苦情、サービス案内', '관광 상담, 민원, 서비스 안내'),
  },
  {
    id: 'city-hotline',
    label: text('城市服务', 'City Service', '都市サービス', '도시 서비스'),
    value: '12345',
    href: 'tel:12345',
    detail: text('城市公共服务与应急转办', 'Public service and urgent case transfer', '公共サービスと緊急取次', '공공 서비스 및 긴급 이관'),
  },
])

onMounted(() => {
  void ensureCatalog()
})
</script>

<template>
  <section id="notices" class="official-notice" aria-labelledby="official-notice-title">
    <div class="official-notice__inner">
      <header class="official-notice__head">
        <div>
          <p class="official-notice__eyebrow">Official Service Notice</p>
          <h2 id="official-notice-title">{{ pickLocalized(text('公告与服务', 'Notices & Services', '告知とサービス', '공지 및 서비스')) }}</h2>
        </div>
        <RouterLink to="/visit-guide">{{ pickLocalized(text('查看访前须知', 'Plan your visit', '訪問前ガイド', '방문 전 안내')) }}</RouterLink>
      </header>

      <div class="official-notice__layout">
        <div class="official-notice__list">
          <article v-for="notice in notices" :key="notice.id" class="notice-card">
            <small>{{ pickLocalized(notice.tag) }}</small>
            <h3>{{ pickLocalized(notice.title) }}</h3>
            <p>{{ pickLocalized(notice.detail) }}</p>
          </article>
        </div>

        <aside class="service-panel" aria-label="Service contacts">
          <article v-for="service in services" :key="service.id">
            <small>{{ pickLocalized(service.label) }}</small>
            <a v-if="service.href" :href="service.href">{{ service.value }}</a>
            <strong v-else>{{ service.value }}</strong>
            <p>{{ pickLocalized(service.detail) }}</p>
          </article>
        </aside>
      </div>
    </div>
  </section>
</template>

<style scoped>
.official-notice {
  background: rgba(250, 247, 240, 0.98);
  color: var(--ink);
  border-bottom: 1px solid rgba(16, 20, 18, 0.08);
}

.official-notice__inner {
  max-width: 1360px;
  margin: 0 auto;
  padding: clamp(54px, 7vw, 92px) clamp(20px, 3vw, 48px);
}

.official-notice__head {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 24px;
  align-items: end;
  padding-bottom: clamp(24px, 3vw, 38px);
  border-bottom: 1px solid rgba(16, 20, 18, 0.1);
}

.official-notice__eyebrow,
.notice-card small,
.service-panel small {
  color: rgba(16, 20, 18, 0.46);
  font-size: 11px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
}

.official-notice__head h2 {
  margin-top: 14px;
  font-family: var(--font-serif);
  font-size: clamp(30px, 4vw, 58px);
  font-weight: 400;
  letter-spacing: 0.04em;
  line-height: 1.16;
}

.official-notice__head a {
  display: inline-flex;
  align-items: center;
  min-height: 42px;
  padding: 12px 16px;
  border: 1px solid rgba(16, 20, 18, 0.12);
  color: rgba(16, 20, 18, 0.68);
  font-size: 12px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  transition: color 220ms ease, border-color 220ms ease;
}

.official-notice__head a:hover,
.official-notice__head a:focus-visible {
  color: var(--deep-green);
  border-color: rgba(31, 58, 52, 0.24);
  outline: none;
}

.official-notice__layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(16rem, 0.32fr);
  gap: clamp(24px, 4vw, 52px);
  margin-top: clamp(28px, 4vw, 48px);
}

.official-notice__list,
.service-panel {
  display: grid;
  gap: 1px;
  border: 1px solid rgba(16, 20, 18, 0.08);
  background: rgba(16, 20, 18, 0.08);
}

.notice-card,
.service-panel article {
  min-width: 0;
  background: rgba(250, 247, 240, 0.92);
}

.notice-card {
  display: grid;
  grid-template-columns: minmax(8rem, 0.24fr) minmax(14rem, 0.34fr) minmax(0, 1fr);
  gap: clamp(16px, 3vw, 36px);
  padding: clamp(20px, 2.6vw, 32px);
  align-items: baseline;
}

.notice-card h3 {
  font-family: var(--font-serif);
  font-size: clamp(19px, 1.7vw, 27px);
  font-weight: 400;
  letter-spacing: 0.04em;
  line-height: 1.35;
}

.notice-card p,
.service-panel p {
  color: rgba(16, 20, 18, 0.62);
  font-size: 14px;
  line-height: 1.8;
}

.service-panel article {
  display: grid;
  gap: 10px;
  padding: clamp(20px, 2.4vw, 30px);
}

.service-panel a,
.service-panel strong {
  width: fit-content;
  color: var(--deep-green);
  font-family: var(--font-serif);
  font-size: clamp(24px, 3vw, 42px);
  font-weight: 400;
  letter-spacing: 0.04em;
  line-height: 1;
}

.service-panel a {
  border-bottom: 1px solid rgba(31, 58, 52, 0.26);
}

@media (max-width: 980px) {
  .official-notice__layout {
    grid-template-columns: 1fr;
  }

  .notice-card {
    grid-template-columns: 1fr;
    gap: 10px;
  }
}

@media (max-width: 720px) {
  .official-notice__head {
    grid-template-columns: 1fr;
    align-items: start;
  }
}
</style>
