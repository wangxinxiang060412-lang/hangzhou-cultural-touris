<script setup lang="ts">
import { computed, onMounted } from 'vue'
import ArchiveHeader from '../components/common/ArchiveHeader.vue'
import PageCrumbs from '../components/common/PageCrumbs.vue'
import SiteFooter from '../components/layout/SiteFooter.vue'
import { getSpotImage, getSpotImagePosition } from '../data/spotImages'
import type { LocalizedText } from '../i18n/site'
import { pickLocalized, t } from '../i18n/site'
import { cityPasses, ensureCatalog, scenicSpots } from '../stores/catalog'
import { ensureDiscovery, neighborhoods } from '../stores/discovery'

const text = (zh: string, en: string, ja: string, ko: string): LocalizedText => ({
  'zh-CN': zh,
  'en-US': en,
  'ja-JP': ja,
  'ko-KR': ko,
})

const neighborhoodCards = computed(() =>
  neighborhoods.value.map((item) => ({
    ...item,
    image: getSpotImage(item.leadSpotId),
    imagePosition: getSpotImagePosition(item.leadSpotId, 'featured'),
    routeTarget: item.suggestedRouteId ? `/routes#route-${item.suggestedRouteId}` : '',
    passTarget: item.suggestedPassId ? `/booking?pass=${item.suggestedPassId}` : '',
    spotLinks: item.featuredSpotIds
      .map((id) => scenicSpots.value.find((spot) => spot.id === id))
      .filter((spot) => Boolean(spot))
      .map((spot) => ({
        id: spot?.id ?? '',
        nameZh: spot?.nameZh ?? '',
      })),
    passLabel:
      cityPasses.value.find((pass) => pass.id === item.suggestedPassId)?.shortLabel ?? null,
  })),
)

onMounted(() => {
  void ensureCatalog()
  void ensureDiscovery()
})
</script>

<template>
  <div class="page-shell">
    <main id="main-content" class="neighborhoods-page" tabindex="-1">
      <section class="neighborhoods-page__hero" aria-labelledby="neighborhoods-title" data-reveal>
        <PageCrumbs
          :items="[
            { label: t('page.home'), to: '/' },
            { label: pickLocalized(text('街区与区域', 'Neighbourhoods', 'エリア', '구역')) },
          ]"
        />

        <div class="neighborhoods-page__hero-meta">
          <span>{{ pickLocalized(text('街区与区域', 'Neighbourhoods', 'エリア', '구역')) }}</span>
          <span>{{ String(neighborhoodCards.length).padStart(2, '0') }}</span>
        </div>

        <ArchiveHeader
          :title-zh="pickLocalized(text('按街区读杭州', 'Read Hangzhou by Neighbourhood', 'エリアで読む杭州', '구역으로 읽는 항저우'))"
          :title-en="pickLocalized(text('Neighbourhoods', 'Neighbourhoods', 'Neighbourhoods', 'Neighbourhoods'))"
          :description="pickLocalized(text('不再把杭州看成平铺景点列表，而是按城市肌理来进入：老城、运河、茶山、湿地，每一片都有自己的节奏和玩法。', 'Move beyond a flat list of attractions and enter Hangzhou by urban texture: old city, canal, tea hills and wetlands.', '単発の景点一覧ではなく、街の文脈ごとに杭州へ入るためのページです。', '단순 명소 목록이 아니라 도시 결에 따라 항저우에 들어가기 위한 페이지입니다.'))"
        />
      </section>

      <section
        class="neighborhoods-page__grid"
        :aria-label="pickLocalized(text('街区列表', 'Neighbourhood list', 'エリア一覧', '구역 목록'))"
      >
        <article
          v-for="item in neighborhoodCards"
          :id="`neighborhood-${item.id}`"
          :key="item.id"
          class="neighborhood-card"
          data-reveal
        >
          <figure class="neighborhood-card__media">
            <img
              v-if="item.image"
              :src="item.image"
              :alt="pickLocalized(item.name)"
              :style="{ objectPosition: item.imagePosition }"
              loading="lazy"
              decoding="async"
            />
            <div class="neighborhood-card__overlay">
              <p>{{ pickLocalized(item.district) }}</p>
              <h2>{{ pickLocalized(item.name) }}</h2>
              <span>{{ item.nameEn }}</span>
            </div>
          </figure>

          <div class="neighborhood-card__body">
            <div class="neighborhood-card__intro">
              <p class="neighborhood-card__theme">{{ pickLocalized(item.theme) }}</p>
              <p class="neighborhood-card__description">{{ pickLocalized(item.description) }}</p>
              <p class="neighborhood-card__mood">{{ pickLocalized(item.moodLine) }}</p>
            </div>

            <div class="neighborhood-card__facts">
              <article>
                <span>{{ pickLocalized(text('最佳进入方式', 'Best Arrival', '入り方', '추천 진입 방식')) }}</span>
                <p>{{ pickLocalized(item.bestArrival) }}</p>
              </article>
              <article>
                <span>{{ pickLocalized(text('吃喝提示', 'Food Rhythm', '食のヒント', '식사 힌트')) }}</span>
                <p>{{ pickLocalized(item.foodHint) }}</p>
              </article>
              <article>
                <span>{{ pickLocalized(text('步行节奏', 'Walking Rhythm', '歩くテンポ', '도보 리듬')) }}</span>
                <p>{{ pickLocalized(item.walkingHint) }}</p>
              </article>
            </div>

            <div class="neighborhood-card__chips">
              <span v-for="tag in item.bestFor" :key="pickLocalized(tag)">{{ pickLocalized(tag) }}</span>
            </div>

            <div class="neighborhood-card__highlights">
              <p>{{ pickLocalized(text('这一片更值得串着看', 'Best Seen Together', 'まとめて見るポイント', '함께 보는 핵심 지점')) }}</p>
              <div>
                <RouterLink
                  v-for="spot in item.spotLinks"
                  :key="spot.id"
                  :to="`/scenic-spots/${spot.id}`"
                >
                  {{ spot.nameZh }}
                </RouterLink>
              </div>
            </div>

            <div class="neighborhood-card__actions">
              <RouterLink v-if="item.routeTarget" :to="item.routeTarget">
                {{ pickLocalized(text('看推荐路线', 'Open Route', 'ルートを見る', '추천 루트 보기')) }}
              </RouterLink>
              <RouterLink v-if="item.passTarget" :to="item.passTarget">
                {{
                  item.passLabel
                    ? pickLocalized(item.passLabel)
                    : pickLocalized(text('看推荐套票', 'Open Pass', 'パスを見る', '추천 패스 보기'))
                }}
              </RouterLink>
            </div>
          </div>
        </article>
      </section>
    </main>
    <SiteFooter />
  </div>
</template>

<style scoped>
.neighborhoods-page {
  background: var(--paper-light);
  color: var(--ink);
}

.neighborhoods-page__hero,
.neighborhoods-page__grid {
  max-width: 1320px;
  margin: 0 auto;
  padding-inline: clamp(20px, 3vw, 48px);
}

.neighborhoods-page__hero {
  padding-top: clamp(80px, 12vw, 152px);
  padding-bottom: 36px;
}

.neighborhoods-page__hero-meta {
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

.neighborhoods-page__grid {
  display: grid;
  gap: 26px;
  padding-bottom: 96px;
}

.neighborhood-card {
  display: grid;
  grid-template-columns: minmax(18rem, 0.8fr) minmax(0, 1fr);
  align-items: start;
  gap: clamp(18px, 2vw, 28px);
  padding: clamp(18px, 2.2vw, 24px);
  background: rgba(250, 247, 240, 0.94);
  border: 1px solid rgba(16, 20, 18, 0.08);
  overflow: hidden;
}

.neighborhood-card__media {
  position: relative;
  align-self: start;
  aspect-ratio: 4 / 4.8;
  overflow: hidden;
  margin: 0;
  background: rgba(16, 20, 18, 0.08);
}

.neighborhood-card__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.neighborhood-card__overlay {
  position: absolute;
  inset: auto 0 0 0;
  display: grid;
  align-content: end;
  gap: 6px;
  min-height: 8.5rem;
  padding: 20px;
  background: linear-gradient(180deg, transparent, rgba(11, 14, 13, 0.82));
  color: rgba(246, 241, 232, 0.96);
}

.neighborhood-card__overlay p,
.neighborhood-card__overlay span {
  font-size: 11px;
  letter-spacing: 0.2em;
  line-height: 1.5;
  text-transform: uppercase;
}

.neighborhood-card__overlay h2 {
  margin: 0;
  max-width: 10ch;
  font-family: var(--font-serif);
  font-size: clamp(28px, 2.7vw, 42px);
  font-weight: 400;
  letter-spacing: 0.03em;
  line-height: 1.08;
  text-wrap: balance;
  overflow-wrap: anywhere;
}

.neighborhood-card__body {
  display: grid;
  gap: 24px;
  padding: clamp(22px, 3vw, 34px);
}

.neighborhood-card__theme {
  color: rgba(16, 20, 18, 0.46);
  font-size: 11px;
  letter-spacing: 0.28em;
  text-transform: uppercase;
}

.neighborhood-card__description,
.neighborhood-card__mood,
.neighborhood-card__facts p {
  line-height: 1.8;
}

.neighborhood-card__description {
  margin-top: 12px;
  font-family: var(--font-serif);
  font-size: clamp(16px, 1.15vw, 18px);
  color: rgba(16, 20, 18, 0.72);
}

.neighborhood-card__mood {
  margin-top: 12px;
  color: rgba(16, 20, 18, 0.54);
}

.neighborhood-card__facts {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.neighborhood-card__facts article {
  display: grid;
  gap: 10px;
}

.neighborhood-card__facts span,
.neighborhood-card__highlights p {
  color: rgba(16, 20, 18, 0.42);
  font-size: 11px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
}

.neighborhood-card__chips,
.neighborhood-card__highlights div,
.neighborhood-card__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.neighborhood-card__chips span,
.neighborhood-card__highlights a,
.neighborhood-card__actions a {
  display: inline-flex;
  align-items: center;
  min-height: 38px;
  padding: 0 14px;
  border: 1px solid rgba(16, 20, 18, 0.12);
  color: rgba(16, 20, 18, 0.72);
}

.neighborhood-card__actions a {
  color: var(--ink);
}

@media (max-width: 960px) {
  .neighborhood-card {
    grid-template-columns: 1fr;
    padding: 18px;
  }

  .neighborhood-card__media {
    aspect-ratio: 4 / 2.6;
  }

  .neighborhood-card__facts {
    grid-template-columns: 1fr;
  }
}
</style>
