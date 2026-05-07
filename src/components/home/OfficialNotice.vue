<script setup lang="ts">
import { computed, onMounted } from 'vue'
import type { LocalizedText } from '../../i18n/site'
import { pickLocalized } from '../../i18n/site'
import {
  ensureOperationsFeed,
  featuredOperationAlerts,
  operationServiceCards,
  type OperationNotice,
  type OperationServiceCard,
} from '../../stores/operations'

type NoticeItem = {
  id: string
  tone?: 'normal' | 'watch' | 'limited' | 'closed'
  tag: LocalizedText
  title: LocalizedText
  detail: LocalizedText
}

const text = (zh: string, en: string, ja: string, ko: string): LocalizedText => ({
  'zh-CN': zh,
  'en-US': en,
  'ja-JP': ja,
  'ko-KR': ko,
})

const baselineNotices: NoticeItem[] = [
  {
    id: 'identity',
    tone: 'normal',
    tag: text('实名核验', 'Identity Check', '本人確認', '본인 확인'),
    title: text('购票、优惠和入场凭证需与有效证件一致', 'Tickets, concessions and entry proof should match valid ID', '券、優待、入場証明は有効な身分証と一致させてください', '티켓, 우대, 입장 증빙은 유효한 신분증과 일치해야 합니다'),
    detail: text('请准确填写姓名、手机号与证件信息；同行多人办理时，部分景点会逐人核验。', 'Enter name, phone and ID accurately. Some sites verify each visitor in multi-person bookings.', '氏名、電話番号、身分証情報を正確に入力してください。複数人の場合、施設により個別確認があります。', '이름, 전화번호, 신분증 정보를 정확히 입력하세요. 여러 명 예약 시 일부 명소는 개별 확인을 합니다.'),
  },
]

const notices = computed<NoticeItem[]>(() => {
  const live = featuredOperationAlerts.value.map((notice: OperationNotice) => ({
    ...notice,
    tone: notice.tone,
  }))

  return [...live, ...baselineNotices].slice(0, 4)
})

const services = computed<OperationServiceCard[]>(() => operationServiceCards.value)

const toneClass = (tone?: NoticeItem['tone']) => (tone ? `is-${tone}` : '')

onMounted(() => {
  void ensureOperationsFeed()
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
          <article
            v-for="notice in notices"
            :key="notice.id"
            class="notice-card"
            :class="toneClass(notice.tone)"
          >
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

.notice-card.is-watch,
.notice-card.is-limited,
.notice-card.is-closed {
  box-shadow: inset 3px 0 0 rgba(31, 58, 52, 0.18);
}

.notice-card.is-watch {
  background: rgba(250, 247, 240, 0.96);
}

.notice-card.is-limited {
  background: rgba(247, 242, 232, 0.98);
  box-shadow: inset 3px 0 0 rgba(167, 121, 58, 0.42);
}

.notice-card.is-closed {
  background: rgba(244, 237, 229, 0.98);
  box-shadow: inset 3px 0 0 rgba(146, 84, 52, 0.42);
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
