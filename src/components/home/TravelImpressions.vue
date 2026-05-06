<script setup lang="ts">
import ArchiveHeader from '../common/ArchiveHeader.vue'
import { travelImpressions } from '../../data/archive'
import { pickLocalized, t } from '../../i18n/site'
</script>

<template>
  <section class="travel-impressions" :aria-label="t('visual.indexAria')">
    <div class="travel-impressions__inner">
      <header class="travel-impressions__heading" data-reveal>
        <div class="travel-impressions__meta">
          <p>{{ t('visual.eyebrow') }}</p>
          <p>{{ travelImpressions.length.toString().padStart(2, '0') }} {{ t('visual.unit') }}</p>
        </div>
        <ArchiveHeader
          eyebrow=""
          :title-zh="t('visual.titleZh')"
          :title-en="t('visual.titleEn')"
          :description="t('visual.description')"
        />
      </header>

      <div class="travel-impressions__grid" data-reveal style="--reveal-delay: 120ms">
        <article v-for="item in travelImpressions" :key="item.id" class="impression-card">
          <figure class="impression-card__media">
            <img
              v-if="item.image"
              :src="item.image"
              :alt="pickLocalized(item.title)"
              loading="lazy"
              decoding="async"
            />
          </figure>
          <div class="impression-card__body">
            <h3>{{ pickLocalized(item.title) }}</h3>
            <p class="impression-card__title-en">{{ item.titleEn }}</p>
            <p>{{ pickLocalized(item.description) }}</p>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.travel-impressions {
  background: var(--paper-light);
}

.travel-impressions__inner {
  max-width: 1420px;
  margin: 0 auto;
  padding: clamp(92px, 11vw, 160px) clamp(20px, 3vw, 48px);
}

.travel-impressions__meta {
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

.travel-impressions__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1px;
  margin-top: clamp(52px, 6vw, 84px);
  border: 1px solid rgba(16, 20, 18, 0.08);
  background: rgba(16, 20, 18, 0.08);
}

.impression-card {
  background: rgba(250, 247, 240, 0.92);
}

.impression-card__media {
  margin: 0;
  aspect-ratio: 4 / 2.8;
  overflow: hidden;
  background: rgba(216, 221, 214, 0.42);
}

.impression-card__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 50% 50%;
  filter: saturate(0.82) contrast(0.94);
}

.impression-card__body {
  display: grid;
  gap: 10px;
  padding: clamp(20px, 2.4vw, 28px);
}

.impression-card__body h3 {
  font-family: var(--font-serif);
  font-size: clamp(22px, 2vw, 30px);
  font-weight: 400;
  letter-spacing: 0.05em;
}

.impression-card__title-en {
  color: rgba(16, 20, 18, 0.46);
  font-size: 11px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
}

.impression-card__body p {
  color: rgba(16, 20, 18, 0.62);
  line-height: 1.8;
}

@media (max-width: 860px) {
  .travel-impressions__grid {
    grid-template-columns: 1fr;
  }

  .travel-impressions__inner {
    padding-inline: 18px;
  }
}
</style>
