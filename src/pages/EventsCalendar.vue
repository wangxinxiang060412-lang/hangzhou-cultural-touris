<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import ArchiveHeader from '../components/common/ArchiveHeader.vue'
import PageCrumbs from '../components/common/PageCrumbs.vue'
import SiteFooter from '../components/layout/SiteFooter.vue'
import { getSpotImage, getSpotImagePosition } from '../data/spotImages'
import type { LocalizedText } from '../i18n/site'
import { pickLocalized, t } from '../i18n/site'
import { ensureDiscovery, cityEvents } from '../stores/discovery'

const text = (zh: string, en: string, ja: string, ko: string): LocalizedText => ({
  'zh-CN': zh,
  'en-US': en,
  'ja-JP': ja,
  'ko-KR': ko,
})

const filters = [
  { id: 'all', label: text('全部', 'All', 'すべて', '전체') },
  { id: 'spring', label: text('春季', 'Spring', '春', '봄') },
  { id: 'summer', label: text('夏季', 'Summer', '夏', '여름') },
  { id: 'autumn', label: text('秋季', 'Autumn', '秋', '가을') },
  { id: 'holiday', label: text('节假日', 'Holiday', '祝祭', '연휴') },
] as const

const activeFilter = ref<(typeof filters)[number]['id']>('all')

const events = computed(() =>
  cityEvents.value.map((item) => ({
    ...item,
    image: getSpotImage(item.leadSpotId),
    imagePosition: getSpotImagePosition(item.leadSpotId, 'featured'),
  })),
)

const filteredEvents = computed(() => {
  if (activeFilter.value === 'all') return events.value
  const terms: Record<string, string[]> = {
    spring: ['3 月', '4 月', '5 月', 'Mar', 'Apr', 'May', '3月', '4月', '5月', '3월', '4월', '5월'],
    summer: ['7 月', '8 月', 'Jul', 'Aug', '7月', '8月', '7월', '8월'],
    autumn: ['11 月', 'Nov', '11月', '11월'],
    holiday: ['节假日', 'Holiday', '祝祭', '연휴'],
  }
  return events.value.filter((item) =>
    terms[activeFilter.value].some((term) => pickLocalized(item.monthLabel).includes(term)),
  )
})

onMounted(() => {
  void ensureDiscovery()
})
</script>

<template>
  <div class="page-shell">
    <main id="main-content" class="events-page" tabindex="-1">
      <section class="events-page__hero" aria-labelledby="events-title" data-reveal>
        <PageCrumbs
          :items="[
            { label: t('page.home'), to: '/' },
            { label: pickLocalized(text('活动日历', 'What’s On', 'イベント', '이벤트')) },
          ]"
        />

        <div class="events-page__hero-meta">
          <span>{{ pickLocalized(text('活动日历', 'What’s On', 'イベント', '이벤트')) }}</span>
          <span>{{ String(filteredEvents.length).padStart(2, '0') }}</span>
        </div>

        <ArchiveHeader
          :title-zh="pickLocalized(text('这个季节去杭州还能看什么', 'What’s On in Hangzhou', 'この季節の杭州で何を見るか', '이번 시즌 항저우에서 무엇을 볼까'))"
          :title-en="pickLocalized(text('What’s On', 'What’s On', 'What’s On', 'What’s On'))"
          :description="pickLocalized(text('重游的理由，很多时候不是另一个景点，而是这座城市当下在发生什么。把活动、节庆和季节性提醒放进同一页，用户才更容易决定“这周要不要来”。', 'Repeat travel is often triggered by what is happening now in the city, not just by one more attraction.', '再訪の理由は別の景点ではなく、街で何が起きているかで決まることが多いです。', '재방문의 이유는 다른 명소보다 지금 이 도시에서 무엇이 벌어지고 있는가에 달려 있는 경우가 많습니다.'))"
        />
      </section>

      <section class="events-page__filters" data-reveal>
        <div class="events-page__filter-row" role="group" :aria-label="pickLocalized(text('活动筛选', 'Event filters', '絞り込み', '필터'))">
          <button
            v-for="filter in filters"
            :key="filter.id"
            type="button"
            :class="{ 'is-active': filter.id === activeFilter }"
            @click="activeFilter = filter.id"
          >
            {{ pickLocalized(filter.label) }}
          </button>
        </div>
      </section>

      <section class="events-page__list" :aria-label="pickLocalized(text('活动列表', 'Event list', 'イベント一覧', '이벤트 목록'))">
        <article
          v-for="item in filteredEvents"
          :id="`event-${item.id}`"
          :key="item.id"
          class="event-card"
          data-reveal
        >
          <figure class="event-card__media">
            <img
              v-if="item.image"
              :src="item.image"
              :alt="pickLocalized(item.name)"
              :style="{ objectPosition: item.imagePosition }"
              loading="lazy"
              decoding="async"
            />
          </figure>

          <div class="event-card__body">
            <div class="event-card__head">
              <div>
                <p class="event-card__meta">{{ pickLocalized(item.category) }} · {{ pickLocalized(item.monthLabel) }}</p>
                <h2>{{ pickLocalized(item.name) }}</h2>
                <span>{{ item.nameEn }}</span>
              </div>
              <strong>{{ pickLocalized(item.district) }}</strong>
            </div>

            <p class="event-card__description">{{ pickLocalized(item.description) }}</p>

            <div class="event-card__facts">
              <article>
                <span>{{ pickLocalized(text('适合谁', 'Best For', '向いている人', '추천 대상')) }}</span>
                <p>{{ pickLocalized(item.bestFor) }}</p>
              </article>
              <article>
                <span>{{ pickLocalized(text('预约提醒', 'Booking Alert', '予約の注意', '예약 알림')) }}</span>
                <p>{{ pickLocalized(item.bookingAlert) }}</p>
              </article>
              <article>
                <span>{{ pickLocalized(text('天气预案', 'Weather Plan', '天候時の代替', '날씨 대응')) }}</span>
                <p>{{ pickLocalized(item.weatherPlan) }}</p>
              </article>
            </div>

            <div class="event-card__notice">
              <span>{{ pickLocalized(text('说明', 'Note', '補足', '안내')) }}</span>
              <p>{{ pickLocalized(item.statusNote) }}</p>
            </div>
          </div>
        </article>
      </section>
    </main>
    <SiteFooter />
  </div>
</template>

<style scoped>
.events-page {
  background: var(--paper-light);
  color: var(--ink);
}

.events-page__hero,
.events-page__filters,
.events-page__list {
  max-width: 1320px;
  margin: 0 auto;
  padding-inline: clamp(20px, 3vw, 48px);
}

.events-page__hero {
  padding-top: clamp(80px, 12vw, 152px);
  padding-bottom: 32px;
}

.events-page__hero-meta {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 16px;
  margin-bottom: 34px;
  border-bottom: 1px solid rgba(16, 20, 18, 0.08);
  color: rgba(16, 20, 18, 0.42);
  font-size: 11px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
}

.events-page__filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding-bottom: 26px;
}

.events-page__filter-row button {
  min-height: 38px;
  padding: 0 16px;
  border: 1px solid rgba(16, 20, 18, 0.12);
  background: rgba(250, 247, 240, 0.88);
  color: rgba(16, 20, 18, 0.72);
}

.events-page__filter-row button.is-active {
  background: var(--ink);
  border-color: var(--ink);
  color: #f6f1e8;
}

.events-page__list {
  display: grid;
  gap: 18px;
  padding-bottom: 96px;
}

.event-card {
  display: grid;
  grid-template-columns: minmax(18rem, 0.72fr) minmax(0, 1fr);
  align-items: start;
  gap: clamp(18px, 2vw, 28px);
  padding: clamp(18px, 2.2vw, 24px);
  border: 1px solid rgba(16, 20, 18, 0.08);
  background: rgba(250, 247, 240, 0.94);
  overflow: hidden;
}

.event-card__media {
  align-self: start;
  aspect-ratio: 4 / 3.1;
  overflow: hidden;
  margin: 0;
  background: rgba(216, 221, 214, 0.42);
}

.event-card__media img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.event-card__body {
  display: grid;
  gap: 20px;
  padding: clamp(22px, 3vw, 32px);
}

.event-card__head {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 16px;
  align-items: start;
}

.event-card__meta,
.event-card__head span,
.event-card__facts span,
.event-card__notice span {
  color: rgba(16, 20, 18, 0.42);
  font-size: 11px;
  letter-spacing: 0.28em;
  text-transform: uppercase;
}

.event-card__head h2 {
  margin: 10px 0 8px;
  max-width: 15ch;
  font-family: var(--font-serif);
  font-size: clamp(26px, 2.5vw, 40px);
  font-weight: 400;
  letter-spacing: 0.03em;
  line-height: 1.1;
  text-wrap: balance;
  overflow-wrap: anywhere;
}

.event-card__head strong {
  font-size: 13px;
  color: rgba(16, 20, 18, 0.62);
  white-space: nowrap;
}

.event-card__description,
.event-card__facts p,
.event-card__notice p {
  line-height: 1.8;
}

.event-card__description {
  font-family: var(--font-serif);
  font-size: clamp(16px, 1.1vw, 18px);
  color: rgba(16, 20, 18, 0.7);
}

.event-card__facts {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.event-card__facts article,
.event-card__notice {
  display: grid;
  gap: 10px;
}

@media (max-width: 960px) {
  .event-card {
    grid-template-columns: 1fr;
    padding: 18px;
  }

  .event-card__media {
    aspect-ratio: 4 / 2.55;
  }

  .event-card__head,
  .event-card__facts {
    grid-template-columns: 1fr;
  }

  .event-card__head strong {
    white-space: normal;
  }
}
</style>
