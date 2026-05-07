<script setup lang="ts">
import { computed, onMounted } from 'vue'
import ArchiveHeader from '../components/common/ArchiveHeader.vue'
import PageCrumbs from '../components/common/PageCrumbs.vue'
import SiteFooter from '../components/layout/SiteFooter.vue'
import { getSpotImage, getSpotImagePosition } from '../data/spotImages'
import type { LocalizedText } from '../i18n/site'
import { pickLocalized, t } from '../i18n/site'
import { cityPasses, ensureCatalog, findScenicSpot } from '../stores/catalog'
import { localizeSpotName } from '../utils/localization'

const text = (zh: string, en: string, ja: string, ko: string): LocalizedText => ({
  'zh-CN': zh,
  'en-US': en,
  'ja-JP': ja,
  'ko-KR': ko,
})

const pageTitle = text('城市组合票', 'City Passes', 'シティパス', '시티 패스')
const pageDescription = text(
  '把预约、路线、交通和更完整的体验打包成更容易决策的产品，而不只是拆散的单景点门票。',
  'Bundle reservations, routes, transport and fuller experiences into products that are easier to choose than isolated attraction tickets.',
  '個別チケットではなく、予約・ルート・交通をまとめた選びやすい商品群です。',
  '개별 입장권이 아니라 예약, 동선, 교통을 묶어 더 고르기 쉬운 상품 구성입니다.',
)

const passCards = computed(() =>
  cityPasses.value.map((pass) => {
    const primarySpot = findScenicSpot(pass.primarySpotId)
    const includedSpots = pass.includedSpotIds
      .map((spotId) => findScenicSpot(spotId))
      .filter((spot): spot is NonNullable<typeof spot> => Boolean(spot))

    return {
      ...pass,
      image: getSpotImage(pass.coverSpotId),
      imagePosition: getSpotImagePosition(pass.coverSpotId, 'featured'),
      primarySpot,
      includedSpots,
      savings: Math.max(pass.marketPrice - pass.price, 0),
      routeHref: pass.suggestedRouteId ? `/routes#route-${pass.suggestedRouteId}` : '/routes',
    }
  }),
)

onMounted(() => {
  void ensureCatalog()
})
</script>

<template>
  <div class="page-shell">
    <main id="main-content" class="city-pass-page" tabindex="-1">
      <section class="city-pass-page__hero" aria-labelledby="city-pass-title" data-reveal>
        <PageCrumbs
          :items="[
            { label: t('page.home'), to: '/' },
            { label: pickLocalized(pageTitle) },
          ]"
        />

        <div class="city-pass-page__hero-meta">
          <span>{{ pickLocalized(text('组合产品', 'Bundle Products', 'セット商品', '번들 상품')) }}</span>
          <span>{{ String(passCards.length).padStart(2, '0') }}</span>
        </div>

        <ArchiveHeader
          :title-zh="pickLocalized(pageTitle)"
          title-en="City Passes"
          :description="pickLocalized(pageDescription)"
        />
      </section>

      <section class="city-pass-page__intro" :aria-label="pickLocalized(pageTitle)" data-reveal="soft">
        <article>
          <small>{{ pickLocalized(text('为什么需要这一层', 'Why This Layer Matters', 'なぜ必要か', '왜 필요한가')) }}</small>
          <p>{{ pickLocalized(text('国际游客和短停留用户做决策时，通常先选“今天怎么买得更省事、附近怎么玩得更顺”，再选具体单景点。', 'International and short-stay visitors often choose the easiest product for the day before they choose each attraction separately.', '短期滞在者や海外旅行者は、まずその日に使いやすい商品を選び、その後で個別地点を決めることが多いです。', '단기 체류객과 국제 방문객은 보통 개별 명소보다 먼저 그날 가장 쓰기 쉬운 상품을 고릅니다.')) }}</p>
        </article>
        <article>
          <small>{{ pickLocalized(text('现在会得到什么', 'What Visitors Get', '今できること', '지금 제공되는 것')) }}</small>
          <p>{{ pickLocalized(text('每张组合票都给出激活景点、适合人群、包含权益、交通提示和建议路线，用户不需要在多个页面之间自己拼信息。', 'Each pass spells out its activation point, audience, included benefits, transport cues and suggested route so visitors do not have to assemble the trip themselves.', '各パスには起点、対象、特典、交通、推奨ルートがまとまっており、複数ページを自力でつなぐ必要がありません。', '각 패스는 시작 지점, 대상, 혜택, 교통, 추천 루트를 함께 제공해 사용자가 여러 페이지를 오가며 조합할 필요가 없습니다.')) }}</p>
        </article>
      </section>

      <section class="city-pass-grid" :aria-label="pickLocalized(text('组合票列表', 'City Pass List', 'パス一覧', '패스 목록'))" data-reveal>
        <article v-for="pass in passCards" :key="pass.id" class="city-pass-card">
          <div class="city-pass-card__media">
            <img
              v-if="pass.image"
              :src="pass.image"
              :alt="pickLocalized(pass.name)"
              :style="{ objectPosition: pass.imagePosition }"
              loading="lazy"
              decoding="async"
            />
            <div v-else class="city-pass-card__placeholder" aria-hidden="true">
              {{ pickLocalized(pass.shortLabel).slice(0, 2) }}
            </div>
          </div>

          <div class="city-pass-card__body">
            <div class="city-pass-card__top">
              <div>
                <p class="city-pass-card__eyebrow">{{ pickLocalized(pass.shortLabel) }}</p>
                <h2>{{ pickLocalized(pass.name) }}</h2>
              </div>
              <div class="city-pass-card__price">
                <strong>¥{{ pass.price }}</strong>
                <span>¥{{ pass.marketPrice }}</span>
                <small>{{ pickLocalized(text(`省 ¥${pass.savings}`, `Save ¥${pass.savings}`, `¥${pass.savings} お得`, `¥${pass.savings} 절약`)) }}</small>
              </div>
            </div>

            <p class="city-pass-card__description">{{ pickLocalized(pass.description) }}</p>

            <dl class="city-pass-card__facts">
              <div>
                <dt>{{ pickLocalized(text('适合', 'Best For', 'おすすめ', '추천 대상')) }}</dt>
                <dd>{{ pickLocalized(pass.suitableFor) }}</dd>
              </div>
              <div>
                <dt>{{ pickLocalized(text('使用方式', 'Use Window', '利用方法', '이용 방식')) }}</dt>
                <dd>{{ pickLocalized(pass.duration) }}</dd>
              </div>
              <div>
                <dt>{{ pickLocalized(text('激活景点', 'Activation Spot', '起点', '활성화 지점')) }}</dt>
                <dd>{{ pass.primarySpot ? localizeSpotName(pass.primarySpot) : pass.primarySpotId }}</dd>
              </div>
              <div>
                <dt>{{ pickLocalized(text('建议路线', 'Suggested Route', '推奨ルート', '추천 루트')) }}</dt>
                <dd>{{ pickLocalized(pass.routeNote) }}</dd>
              </div>
            </dl>

            <div class="city-pass-card__section">
              <small>{{ pickLocalized(text('包含权益', 'Included Benefits', '含まれる特典', '포함 혜택')) }}</small>
              <ul>
                <li v-for="item in pass.includedBenefits" :key="pickLocalized(item)">{{ pickLocalized(item) }}</li>
              </ul>
            </div>

            <div class="city-pass-card__section city-pass-card__section--split">
              <article>
                <small>{{ pickLocalized(text('交通提示', 'Transit Note', '交通メモ', '교통 팁')) }}</small>
                <p>{{ pickLocalized(pass.transportNote) }}</p>
              </article>
              <article>
                <small>{{ pickLocalized(text('激活规则', 'Activation Rule', '有効化ルール', '활성화 규칙')) }}</small>
                <p>{{ pickLocalized(pass.activationNote) }}</p>
              </article>
            </div>

            <div class="city-pass-card__spots">
              <span v-for="spot in pass.includedSpots" :key="spot.id">{{ localizeSpotName(spot) }}</span>
            </div>

            <div class="city-pass-card__actions">
              <RouterLink :to="{ path: '/booking', query: { pass: pass.id } }">
                {{ t('common.startReservation') }}
              </RouterLink>
              <RouterLink :to="pass.routeHref">{{ t('nav.routes') }}</RouterLink>
            </div>
          </div>
        </article>
      </section>
    </main>
    <SiteFooter />
  </div>
</template>

<style scoped>
.city-pass-page {
  background:
    linear-gradient(180deg, rgba(250, 247, 240, 0.98), rgba(244, 239, 230, 0.96)),
    radial-gradient(circle at top left, rgba(106, 143, 126, 0.14), transparent 32%);
  color: var(--ink);
}

.city-pass-page__hero,
.city-pass-page__intro,
.city-pass-grid {
  max-width: 1320px;
  margin: 0 auto;
  padding-inline: clamp(20px, 3vw, 48px);
}

.city-pass-page__hero {
  padding-top: clamp(80px, 12vw, 152px);
  padding-bottom: clamp(40px, 6vw, 72px);
}

.city-pass-page__hero-meta {
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

.city-pass-page__intro {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1px;
  background: rgba(16, 20, 18, 0.08);
}

.city-pass-page__intro article {
  padding: 24px 26px;
  background: rgba(252, 249, 243, 0.92);
}

.city-pass-page__intro small,
.city-pass-card__eyebrow,
.city-pass-card__section small,
.city-pass-card__facts dt {
  color: rgba(16, 20, 18, 0.42);
  font-size: 11px;
  letter-spacing: 0.28em;
  text-transform: uppercase;
}

.city-pass-page__intro p,
.city-pass-card__description,
.city-pass-card__section p,
.city-pass-card__section li,
.city-pass-card__facts dd {
  margin: 0;
  color: rgba(16, 20, 18, 0.76);
  line-height: 1.8;
}

.city-pass-grid {
  display: grid;
  gap: 28px;
  padding-top: clamp(34px, 5vw, 56px);
  padding-bottom: clamp(80px, 10vw, 120px);
}

.city-pass-card {
  display: grid;
  grid-template-columns: minmax(320px, 0.44fr) minmax(0, 1fr);
  align-items: start;
  gap: clamp(18px, 2vw, 28px);
  min-width: 0;
  padding: clamp(18px, 2.2vw, 24px);
  border: 1px solid rgba(16, 20, 18, 0.08);
  background: rgba(252, 249, 243, 0.96);
}

.city-pass-card__media {
  align-self: start;
  aspect-ratio: 4 / 3.3;
  overflow: hidden;
  background: rgba(216, 221, 214, 0.42);
}

.city-pass-card__media img,
.city-pass-card__placeholder {
  display: block;
  width: 100%;
  height: 100%;
  min-height: 0;
}

.city-pass-card__media img {
  object-fit: cover;
}

.city-pass-card__placeholder {
  display: grid;
  place-items: center;
  color: rgba(31, 58, 52, 0.42);
  font-family: var(--font-serif);
  font-size: 36px;
}

.city-pass-card__body {
  display: grid;
  gap: 22px;
  padding: clamp(24px, 3vw, 34px);
}

.city-pass-card__top {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: flex-start;
  gap: 24px;
}

.city-pass-card__top h2 {
  margin: 6px 0 0;
  max-width: 15ch;
  font-family: var(--font-serif);
  font-size: clamp(28px, 3vw, 40px);
  font-weight: 400;
  letter-spacing: 0.04em;
  line-height: 1.12;
  text-wrap: balance;
  overflow-wrap: anywhere;
}

.city-pass-card__price {
  display: grid;
  justify-items: end;
  gap: 4px;
  white-space: nowrap;
}

.city-pass-card__price strong {
  font-size: clamp(28px, 3vw, 40px);
  line-height: 1;
}

.city-pass-card__price span {
  color: rgba(16, 20, 18, 0.34);
  text-decoration: line-through;
}

.city-pass-card__price small {
  color: var(--westlake-green);
}

.city-pass-card__description {
  max-width: 46rem;
}

.city-pass-card__facts {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px 22px;
  margin: 0;
}

.city-pass-card__facts div,
.city-pass-card__section--split {
  padding-top: 16px;
  border-top: 1px solid rgba(16, 20, 18, 0.08);
}

.city-pass-card__facts dd {
  margin-top: 8px;
}

.city-pass-card__section ul {
  display: grid;
  gap: 10px;
  padding-left: 18px;
  margin: 12px 0 0;
}

.city-pass-card__section--split {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.city-pass-card__spots {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.city-pass-card__spots span {
  padding: 8px 12px;
  border: 1px solid rgba(16, 20, 18, 0.1);
  color: rgba(16, 20, 18, 0.76);
  font-size: 13px;
}

.city-pass-card__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.city-pass-card__actions a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0 18px;
  border: 1px solid rgba(16, 20, 18, 0.12);
  color: var(--ink);
  transition:
    background 220ms ease,
    color 220ms ease,
    border-color 220ms ease;
}

.city-pass-card__actions a:first-child {
  background: var(--ink);
  color: #f6f1e8;
}

.city-pass-card__actions a:hover {
  border-color: rgba(16, 20, 18, 0.28);
}

@media (max-width: 960px) {
  .city-pass-page__intro,
  .city-pass-card,
  .city-pass-card__section--split,
  .city-pass-card__facts {
    grid-template-columns: 1fr;
  }

  .city-pass-card {
    padding: 18px;
  }

  .city-pass-card__top {
    grid-template-columns: 1fr;
    gap: 18px;
  }

  .city-pass-card__price {
    justify-items: start;
    white-space: normal;
  }

  .city-pass-card__media {
    aspect-ratio: 4 / 2.65;
  }
}
</style>
