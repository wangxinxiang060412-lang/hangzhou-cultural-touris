<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { t } from '../../i18n/site'
import { ensureCatalog, scenicSpots } from '../../stores/catalog'
import {
  localizeSpotArea,
  localizeSpotCategory,
  localizeSpotName,
} from '../../utils/localization'

const previewSpots = computed(() => scenicSpots.value.slice(0, 8))
const recordCount = computed(() => scenicSpots.value.length.toString().padStart(2, '0'))

onMounted(() => {
  void ensureCatalog()
})
</script>

<template>
  <section id="places" class="places-archive" aria-labelledby="places-archive-title">
    <div class="places-archive__inner">
      <header class="places-archive__heading" data-reveal>
        <div class="places-archive__meta">
          <p>{{ t('places.eyebrow') }}</p>
          <p>{{ recordCount }} {{ t('places.unit') }}</p>
        </div>

        <div class="places-archive__title-row">
          <p id="places-archive-title" class="places-archive__title-zh">{{ t('places.titleZh') }}</p>
          <div class="places-archive__copy">
            <h2>{{ t('places.titleEn') }}</h2>
            <p>{{ t('places.description') }}</p>
          </div>
        </div>
      </header>

      <div class="places-archive__list" data-reveal style="--reveal-delay: 120ms">
        <RouterLink
          v-for="(spot, index) in previewSpots"
          :key="spot.id"
          :to="`/scenic-spots/${spot.id}`"
          class="place-row"
        >
          <span class="place-row__id">{{ String(index + 1).padStart(2, '0') }}</span>
          <span class="place-row__name">
            <strong>{{ localizeSpotName(spot) }}</strong>
            <small>{{ spot.nameEn }}</small>
          </span>
          <span class="place-row__meta">{{ localizeSpotArea(spot) }}</span>
          <span class="place-row__meta">{{ localizeSpotCategory(spot) }}</span>
          <span class="place-row__state">{{ spot.reservationRequired ? t('state.reservationRequired') : t('state.openVisit') }}</span>
        </RouterLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
.places-archive {
  position: relative;
  overflow: hidden;
  overflow: clip;
  background:
    radial-gradient(circle at 82% 14%, rgba(138, 106, 79, 0.06), transparent 22%),
    linear-gradient(180deg, rgba(250, 247, 240, 0.98), rgba(244, 239, 230, 0.94));
}

.places-archive__inner {
  max-width: 1420px;
  margin: 0 auto;
  padding: clamp(92px, 11vw, 160px) clamp(20px, 3vw, 48px);
}

.places-archive__heading {
  max-width: 980px;
}

.places-archive__meta {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  padding-bottom: 14px;
  border-bottom: 1px solid rgba(16, 20, 18, 0.09);
  color: rgba(16, 20, 18, 0.42);
  font-size: 11px;
  letter-spacing: 0.28em;
  text-transform: uppercase;
}

.places-archive__title-row {
  display: grid;
  grid-template-columns: minmax(8rem, 0.42fr) minmax(0, 1fr);
  gap: clamp(26px, 4vw, 52px);
  padding-top: clamp(22px, 3vw, 34px);
}

.places-archive__title-zh {
  font-family: var(--font-serif);
  font-size: clamp(40px, 5vw, 68px);
  font-weight: 400;
  letter-spacing: 0.12em;
  line-height: 1;
}

.places-archive__copy {
  max-width: 34rem;
  padding-top: 6px;
}

.places-archive__copy h2 {
  font-family: var(--font-serif);
  font-size: clamp(24px, 2.4vw, 34px);
  font-weight: 400;
  letter-spacing: 0.04em;
  line-height: 1.16;
}

.places-archive__copy p {
  max-width: 27rem;
  margin-top: 18px;
  color: rgba(16, 20, 18, 0.56);
  font-size: 14px;
  letter-spacing: 0.05em;
  line-height: 1.85;
}

.places-archive__list {
  margin-top: clamp(52px, 6vw, 84px);
  border-top: 1px solid rgba(16, 20, 18, 0.1);
}

.place-row {
  display: grid;
  grid-template-columns: 64px minmax(16rem, 0.9fr) minmax(8rem, 0.45fr) minmax(8rem, 0.35fr) auto;
  gap: clamp(16px, 3vw, 44px);
  align-items: baseline;
  padding: clamp(18px, 2.2vw, 28px) 0;
  border-bottom: 1px solid rgba(16, 20, 18, 0.1);
  transition: color 220ms ease, background 220ms ease;
}

.place-row:hover,
.place-row:focus-visible {
  color: var(--deep-green);
  background: linear-gradient(90deg, rgba(127, 156, 141, 0.08), transparent 40%);
  outline: none;
}

.place-row__id {
  color: rgba(16, 20, 18, 0.4);
  font-family: var(--font-serif);
  font-size: 12px;
  letter-spacing: 0.28em;
}

.place-row__name {
  display: grid;
  gap: 6px;
}

.place-row__name strong {
  font-family: var(--font-serif);
  font-size: clamp(21px, 2vw, 30px);
  font-weight: 400;
  letter-spacing: 0.05em;
}

.place-row__name small,
.place-row__meta,
.place-row__state {
  color: rgba(16, 20, 18, 0.48);
  font-size: 11px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
}

@media (max-width: 900px) {
  .place-row {
    grid-template-columns: 52px minmax(0, 1fr) auto;
  }

  .place-row__meta:nth-of-type(3),
  .place-row__meta:nth-of-type(4) {
    display: none;
  }
}

@media (max-width: 640px) {
  .places-archive__inner {
    padding-inline: 18px;
  }

  .places-archive__title-row {
    grid-template-columns: 1fr;
  }

  .place-row {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .place-row__id {
    order: -1;
  }
}
</style>
