<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import ArchiveHeader from '../components/common/ArchiveHeader.vue'
import PageCrumbs from '../components/common/PageCrumbs.vue'
import SiteFooter from '../components/layout/SiteFooter.vue'
import { getSpotImage, getSpotImagePosition } from '../data/spotImages'
import { t } from '../i18n/site'
import { catalogError, ensureCatalog, scenicSpots } from '../stores/catalog'
import {
  localizeSpotArea,
  localizeSpotCategory,
  localizeSpotDescription,
  localizeSpotName,
  localizeSpotTags,
} from '../utils/localization'

const searchQuery = ref('')
const selectedCategory = ref('全部')
const selectedArea = ref('全部')
const selectedReservation = ref('全部')
const selectedPaid = ref('全部')

const categories = computed(() => [
  '全部',
  ...Array.from(new Set(scenicSpots.value.map((spot) => spot.category))),
])
const areas = computed(() => [
  '全部',
  ...Array.from(new Set(scenicSpots.value.map((spot) => spot.area))),
])

const filteredSpots = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  return scenicSpots.value.filter((spot) => {
    const matchesQuery =
      !query ||
      spot.nameZh.toLowerCase().includes(query) ||
      spot.nameEn.toLowerCase().includes(query) ||
      spot.tags.some((tag) => tag.toLowerCase().includes(query)) ||
      localizeSpotName(spot).toLowerCase().includes(query) ||
      localizeSpotTags(spot).some((tag) => tag.toLowerCase().includes(query))
    const matchesCategory =
      selectedCategory.value === '全部' || spot.category === selectedCategory.value
    const matchesArea = selectedArea.value === '全部' || spot.area === selectedArea.value
    const matchesReservation =
      selectedReservation.value === '全部' ||
      (selectedReservation.value === '需预约' && spot.reservationRequired) ||
      (selectedReservation.value === '开放参观' && !spot.reservationRequired)
    const matchesPaid =
      selectedPaid.value === '全部' ||
      (selectedPaid.value === '收费' && spot.paid) ||
      (selectedPaid.value === '免费' && !spot.paid)

    return matchesQuery && matchesCategory && matchesArea && matchesReservation && matchesPaid
  })
})

const resetFilters = () => {
  searchQuery.value = ''
  selectedCategory.value = '全部'
  selectedArea.value = '全部'
  selectedReservation.value = '全部'
  selectedPaid.value = '全部'
}

onMounted(() => {
  void ensureCatalog()
})
</script>

<template>
  <div class="page-shell">
    <main id="main-content" class="scenic-page" tabindex="-1">
      <section class="scenic-page__hero" aria-labelledby="scenic-title" data-reveal>
        <PageCrumbs
          :items="[
            { label: t('page.home'), to: '/' },
            { label: t('scenic.title') },
          ]"
        />

        <div class="scenic-page__hero-meta">
          <span>{{ t('scenic.title') }}</span>
          <span>{{ t('scenic.heroCount', { count: scenicSpots.length.toString().padStart(2, '0') }) }}</span>
        </div>

        <ArchiveHeader
          :title-zh="t('scenic.title')"
          title-en="Tickets & Visits"
          :description="t('scenic.description')"
        />

        <div class="scenic-page__hero-actions">
          <RouterLink to="/visit-guide">{{ t('page.visitGuide') }}</RouterLink>
          <RouterLink to="/orders">{{ t('page.orders') }}</RouterLink>
        </div>
      </section>

      <section class="scenic-page__filters" :aria-label="t('scenic.filterAria')" data-reveal>
        <label class="filter-field filter-field--search">
          <span>{{ t('common.search') }}</span>
          <input v-model="searchQuery" type="search" :placeholder="t('scenic.searchPlaceholder')" />
        </label>

        <label class="filter-field">
          <span>{{ t('common.category') }}</span>
          <select v-model="selectedCategory">
            <option v-for="category in categories" :key="category" :value="category">
              {{ category === '全部' ? t('scenic.allOption') : localizeSpotCategory({ category }) }}
            </option>
          </select>
        </label>

        <label class="filter-field">
          <span>{{ t('common.area') }}</span>
          <select v-model="selectedArea">
            <option v-for="area in areas" :key="area" :value="area">
              {{ area === '全部' ? t('scenic.allOption') : localizeSpotArea({ area }) }}
            </option>
          </select>
        </label>

        <label class="filter-field">
          <span>{{ t('common.reservation') }}</span>
          <select v-model="selectedReservation">
            <option value="全部">{{ t('scenic.allOption') }}</option>
            <option value="需预约">{{ t('scenic.option.required') }}</option>
            <option value="开放参观">{{ t('scenic.option.openVisit') }}</option>
          </select>
        </label>

        <label class="filter-field">
          <span>{{ t('common.ticketing') }}</span>
          <select v-model="selectedPaid">
            <option value="全部">{{ t('scenic.allOption') }}</option>
            <option value="收费">{{ t('scenic.option.paid') }}</option>
            <option value="免费">{{ t('scenic.option.free') }}</option>
          </select>
        </label>
      </section>

      <section class="scenic-page__notice" :aria-label="t('scenic.noticeAria')" data-reveal="soft">
        <p>{{ t('scenic.notice') }}</p>
        <RouterLink to="/visit-guide">{{ t('intro.viewGuide') }}</RouterLink>
      </section>

      <section class="scenic-page__list" :aria-label="t('scenic.listAria')" data-reveal>
        <article
          v-for="(spot, index) in filteredSpots"
          :key="spot.id"
          class="scenic-card"
        >
          <span class="scenic-card__id">{{ String(index + 1).padStart(2, '0') }}</span>

          <RouterLink
            :to="`/scenic-spots/${spot.id}`"
            class="scenic-card__media"
            :aria-label="t('scenic.card.viewDetailAria', { name: localizeSpotName(spot) })"
          >
            <img
              v-if="getSpotImage(spot.id)"
              :src="getSpotImage(spot.id) ?? ''"
              :alt="localizeSpotName(spot)"
              :style="{ objectPosition: getSpotImagePosition(spot.id, 'list') }"
              loading="lazy"
              decoding="async"
            />
            <div v-else class="scenic-card__placeholder" aria-hidden="true">
              {{ spot.nameEn.slice(0, 2) }}
            </div>
          </RouterLink>

          <span class="scenic-card__body">
            <span class="scenic-card__topline">
              <span>{{ localizeSpotArea(spot) }}</span>
              <span>{{ localizeSpotCategory(spot) }}</span>
            </span>
            <RouterLink :to="`/scenic-spots/${spot.id}`" class="scenic-card__title">
              <strong>{{ localizeSpotName(spot) }}</strong>
            </RouterLink>
            <small>{{ spot.nameEn }}</small>
            <span class="scenic-card__description">{{ localizeSpotDescription(spot) }}</span>
            <span class="scenic-card__tags">
              <span v-for="tag in localizeSpotTags(spot)" :key="tag">{{ tag }}</span>
            </span>
          </span>

          <span class="scenic-card__state">
            <span>{{ spot.reservationRequired ? t('state.reservationRequired') : t('state.openVisit') }}</span>
            <span>{{ spot.paid ? t('state.containsTickets') : t('state.freeOpen') }}</span>
            <span class="scenic-card__actions">
              <RouterLink :to="`/scenic-spots/${spot.id}`">{{ t('common.viewSpotDetail') }}</RouterLink>
              <RouterLink :to="{ path: '/booking', query: { spot: spot.id } }">{{ t('common.startReservation') }}</RouterLink>
            </span>
          </span>
        </article>

        <div v-if="filteredSpots.length === 0" class="scenic-page__empty">
          <p>{{ catalogError || t('scenic.empty') }}</p>
          <button type="button" @click="resetFilters">{{ t('common.clearFilters') }}</button>
        </div>
      </section>
    </main>
    <SiteFooter />
  </div>
</template>

<style scoped>
.scenic-page {
  background: var(--paper-light);
  color: var(--ink);
}

.scenic-page__hero,
.scenic-page__filters,
.scenic-page__list {
  max-width: 1320px;
  margin: 0 auto;
  padding: 0 clamp(20px, 3vw, 48px);
}

.scenic-page__hero {
  padding-top: clamp(80px, 12vw, 152px);
  padding-bottom: clamp(42px, 6vw, 78px);
}

.scenic-page__hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 28px;
}

.scenic-page__hero-meta {
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

.scenic-page__filters {
  display: grid;
  grid-template-columns: minmax(16rem, 1.3fr) repeat(4, minmax(9rem, 0.7fr));
  gap: 1px;
  margin-bottom: clamp(34px, 5vw, 64px);
  background: rgba(16, 20, 18, 0.08);
  border: 1px solid rgba(16, 20, 18, 0.08);
  padding: 1px;
}

.filter-field {
  display: grid;
  gap: 10px;
  padding: 16px;
  background: rgba(250, 247, 240, 0.94);
}

.filter-field span {
  color: rgba(16, 20, 18, 0.44);
  font-size: 10px;
  letter-spacing: 0.28em;
  text-transform: uppercase;
}

.filter-field input,
.filter-field select {
  width: 100%;
  min-width: 0;
  border: 0;
  border-bottom: 1px solid rgba(16, 20, 18, 0.14);
  border-radius: 0;
  background: transparent;
  color: var(--ink);
  font-size: 14px;
  letter-spacing: 0.04em;
  outline: none;
}

.scenic-page__list {
  padding-bottom: clamp(86px, 11vw, 150px);
}

.scenic-page__notice {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 18px;
  max-width: 1320px;
  margin: 0 auto clamp(32px, 5vw, 46px);
  padding: 18px clamp(20px, 3vw, 48px);
  border-top: 1px solid rgba(16, 20, 18, 0.08);
  border-bottom: 1px solid rgba(16, 20, 18, 0.08);
  color: rgba(16, 20, 18, 0.58);
  font-size: 14px;
  line-height: 1.8;
}

.scenic-card {
  display: grid;
  grid-template-columns: 52px minmax(220px, 240px) minmax(0, 1fr) minmax(9rem, 0.28fr);
  gap: clamp(20px, 3vw, 48px);
  align-items: stretch;
  padding: clamp(22px, 2.8vw, 36px) 0;
  border-top: 1px solid rgba(16, 20, 18, 0.1);
  transition: background 220ms ease, color 220ms ease;
}

.scenic-card:last-child {
  border-bottom: 1px solid rgba(16, 20, 18, 0.1);
}

.scenic-card:hover,
.scenic-card:focus-within {
  color: var(--deep-green);
  background: linear-gradient(90deg, rgba(127, 156, 141, 0.08), transparent 44%);
  outline: none;
}

.scenic-card__id {
  color: rgba(16, 20, 18, 0.42);
  font-family: var(--font-serif);
  font-size: 12px;
  letter-spacing: 0.24em;
}

.scenic-card__media {
  min-width: 0;
  aspect-ratio: 4 / 2.6;
  overflow: hidden;
  border: 1px solid rgba(16, 20, 18, 0.08);
  background: rgba(216, 221, 214, 0.42);
}

.scenic-card__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 50% 50%;
  filter: saturate(0.82) contrast(0.94);
  transition: transform 520ms ease;
}

.scenic-card:hover .scenic-card__media img,
.scenic-card:focus-within .scenic-card__media img {
  transform: scale(1.028);
}

.scenic-card__placeholder {
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  color: rgba(31, 58, 52, 0.42);
  font-family: var(--font-serif);
  font-size: clamp(28px, 4vw, 48px);
  letter-spacing: 0.12em;
  background: linear-gradient(135deg, rgba(244, 239, 230, 0.96), rgba(216, 221, 214, 0.62));
}

.scenic-card__body {
  display: grid;
  gap: 10px;
  align-content: start;
  min-width: 0;
  padding-right: clamp(12px, 2vw, 28px);
}

.scenic-card__topline,
.scenic-card__state,
.scenic-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 16px;
  color: rgba(16, 20, 18, 0.44);
  font-size: 11px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}

.scenic-card__title {
  color: inherit;
}

.scenic-card strong {
  font-family: var(--font-serif);
  font-size: clamp(24px, 2.4vw, 36px);
  font-weight: 400;
  letter-spacing: 0.05em;
  line-height: 1.12;
}

.scenic-card small {
  color: rgba(16, 20, 18, 0.46);
  font-size: 11px;
  letter-spacing: 0.28em;
  text-transform: uppercase;
}

.scenic-card__description {
  max-width: 34rem;
  color: rgba(16, 20, 18, 0.62);
  font-family: var(--font-serif);
  font-size: 15px;
  letter-spacing: 0.04em;
  line-height: 1.85;
}

.scenic-card__state {
  align-content: start;
  justify-content: end;
  text-align: right;
}

.scenic-card__actions {
  display: grid;
  justify-items: end;
  gap: 10px;
  margin-top: 12px;
  text-transform: uppercase;
}

.scenic-card__actions a {
  color: var(--deep-green);
  border-bottom: 1px solid rgba(31, 58, 52, 0.24);
  padding-bottom: 3px;
}

.scenic-card__media:focus-visible,
.scenic-card__title:focus-visible,
.scenic-card__actions a:focus-visible {
  outline: 1px solid rgba(31, 58, 52, 0.38);
  outline-offset: 4px;
}

.scenic-page__empty {
  display: grid;
  justify-items: start;
  gap: 18px;
  padding: 44px 0;
  border-top: 1px solid rgba(16, 20, 18, 0.1);
  color: rgba(16, 20, 18, 0.58);
}

.scenic-page__empty button {
  border: 0;
  background: transparent;
  cursor: pointer;
  color: var(--deep-green);
  font-size: 11px;
  letter-spacing: 0.28em;
  text-transform: uppercase;
}

.scenic-page__hero-actions a,
.scenic-page__notice a {
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

.scenic-page__hero-actions a:hover,
.scenic-page__hero-actions a:focus-visible,
.scenic-page__notice a:hover,
.scenic-page__notice a:focus-visible {
  color: var(--deep-green);
  border-color: rgba(31, 58, 52, 0.2);
  transform: translateX(2px);
  outline: none;
}

@media (max-width: 980px) {
  .scenic-page__notice {
    flex-direction: column;
    align-items: flex-start;
  }

  .scenic-page__filters,
  .scenic-card {
    grid-template-columns: 1fr 1fr;
  }

  .filter-field--search {
    grid-column: 1 / -1;
  }

  .scenic-card__id,
  .scenic-card__state {
    grid-column: 1 / -1;
  }

  .scenic-card__state {
    justify-content: start;
    text-align: left;
  }

  .scenic-card__actions {
    justify-items: start;
  }
}

@media (max-width: 640px) {
  .scenic-page__hero,
  .scenic-page__filters,
  .scenic-page__list {
    padding-inline: 18px;
  }

  .scenic-page__filters,
  .scenic-card {
    grid-template-columns: 1fr;
  }

  .scenic-card__media {
    aspect-ratio: 4 / 2.35;
  }
}
</style>
