<script setup lang="ts">
import ArchiveHeader from '../common/ArchiveHeader.vue'
import { routes } from '../../data/routes'
import { pickLocalized, pickLocalizedList, t } from '../../i18n/site'
</script>

<template>
  <section id="routes" class="route-preview" aria-labelledby="route-preview-title">
    <div class="route-preview__inner">
      <header class="route-preview__heading" data-reveal>
        <div class="route-preview__heading-meta">
          <p class="route-preview__eyebrow">{{ t('routes.eyebrow') }}</p>
          <p class="route-preview__count">{{ routes.length.toString().padStart(2, '0') }} {{ t('routes.unit') }}</p>
        </div>
        <ArchiveHeader
          eyebrow=""
          :title-zh="t('routes.titleZh')"
          :title-en="t('routes.titleEn')"
          :description="t('routes.descriptionShort')"
        />
      </header>

      <div class="route-preview__routes" data-reveal style="--reveal-delay: 120ms">
        <RouterLink
          v-for="route in routes"
          :key="route.id"
          :to="{ path: '/routes', hash: `#route-${route.id}` }"
          class="route-line"
          :aria-label="t('routes.openLinkAria', { title: pickLocalized(route.title) })"
        >
          <figure class="route-line__media">
            <img
              v-if="route.image"
              :src="route.image"
              :alt="pickLocalized(route.title)"
              loading="lazy"
              decoding="async"
            />
            <div v-else class="route-line__placeholder" aria-hidden="true">
              {{ route.id }}
            </div>
          </figure>

          <div class="route-line__heading">
            <p class="route-line__id">{{ route.id }}</p>
            <h3 class="route-line__title">{{ pickLocalized(route.title) }}</h3>
            <p class="route-line__title-en">{{ route.titleEn }}</p>
            <p class="route-line__meta">
              <span>{{ pickLocalized(route.duration) }}</span>
              <span class="route-line__dot" aria-hidden="true">·</span>
              <span>{{ pickLocalized(route.pace) }}</span>
            </p>
          </div>

          <div class="route-line__body">
            <p class="route-line__description">{{ pickLocalized(route.description) }}</p>
            <p class="route-line__audience">{{ t('routes.audiencePrefix') }}{{ pickLocalized(route.audience) }}</p>
            <ol class="route-line__stops" :aria-label="t('routes.stopsAria', { title: pickLocalized(route.title) })">
              <li v-for="stop in pickLocalizedList(route.stops)" :key="stop">{{ stop }}</li>
            </ol>
          </div>
        </RouterLink>
      </div>

      <RouterLink to="/routes" class="route-preview__more" data-reveal="soft">
        <span class="more-rule" aria-hidden="true"></span>
        <span class="more-text">{{ t('routes.preview.cta') }}</span>
        <span class="more-arrow" aria-hidden="true">→</span>
      </RouterLink>
    </div>
  </section>
</template>

<style scoped>
.route-preview {
  position: relative;
  background: var(--paper-light);
  overflow: hidden;
  overflow: clip;
}

.route-preview::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 80% 14%, rgba(127, 156, 141, 0.08), transparent 26%),
    repeating-linear-gradient(
      0deg,
      rgba(16, 20, 18, 0.012) 0,
      rgba(16, 20, 18, 0.012) 1px,
      transparent 1px,
      transparent 22px
    );
  opacity: 0.5;
  pointer-events: none;
}

.route-preview__inner {
  position: relative;
  z-index: 1;
  max-width: 1440px;
  margin: 0 auto;
  padding: clamp(96px, 12vw, 172px) clamp(20px, 3vw, 48px);
}

.route-preview__heading {
  max-width: 980px;
}

.route-preview__heading-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding-bottom: 14px;
  border-bottom: 1px solid rgba(16, 20, 18, 0.09);
  margin-bottom: clamp(22px, 3vw, 36px);
}

.route-preview__eyebrow,
.route-preview__count {
  color: rgba(16, 20, 18, 0.4);
  font-size: 11px;
  letter-spacing: 0.28em;
  line-height: 1.2;
  text-transform: uppercase;
}

.route-preview__count {
  text-align: right;
}

.route-preview__routes {
  display: grid;
  gap: 0;
  margin-top: clamp(40px, 6vw, 70px);
}

.route-line {
  display: grid;
  grid-template-columns: minmax(14rem, 0.42fr) minmax(10rem, 0.3fr) minmax(0, 1fr);
  gap: clamp(28px, 6vw, 86px);
  padding: clamp(34px, 4vw, 56px) 0;
  border-top: 1px solid rgba(16, 20, 18, 0.1);
  align-items: start;
  transition:
    border-color 220ms ease,
    background-color 220ms ease;
}

.route-line:last-child {
  border-bottom: 1px solid rgba(16, 20, 18, 0.1);
}

.route-line:hover {
  border-top-color: rgba(31, 58, 52, 0.2);
  background: linear-gradient(90deg, rgba(127, 156, 141, 0.08), transparent 34%);
}

.route-line:focus-visible {
  outline: none;
  border-top-color: rgba(31, 58, 52, 0.28);
  background: linear-gradient(90deg, rgba(127, 156, 141, 0.11), transparent 38%);
}

.route-line__id {
  color: rgba(16, 20, 18, 0.42);
  font-family: var(--font-serif);
  font-size: 13px;
  letter-spacing: 0.22em;
}

.route-line__title {
  margin-top: 14px;
  color: var(--ink);
  font-family: var(--font-serif);
  font-size: clamp(28px, 3.4vw, 48px);
  font-weight: 400;
  letter-spacing: 0.06em;
  line-height: 1.05;
}

.route-line__title-en {
  margin-top: 10px;
  color: rgba(16, 20, 18, 0.46);
  font-size: 11px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
}

.route-line__meta {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-top: 18px;
  color: rgba(16, 20, 18, 0.48);
  font-size: 11px;
  letter-spacing: 0.28em;
  text-transform: uppercase;
}

.route-line__dot {
  opacity: 0.5;
}

.route-line__body {
  display: grid;
  gap: clamp(22px, 3vw, 30px);
}

.route-line__description {
  max-width: 36rem;
  font-family: var(--font-serif);
  font-size: clamp(15px, 1.05vw, 17px);
  line-height: 1.92;
  letter-spacing: 0.04em;
  color: rgba(16, 20, 18, 0.66);
}

.route-line__audience {
  color: rgba(16, 20, 18, 0.48);
  font-size: 13px;
  letter-spacing: 0.06em;
  line-height: 1.7;
}

.route-line__stops {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px 0;
  margin: 0;
  padding: 0;
  list-style: none;
}

.route-line__stops li {
  position: relative;
  display: inline-flex;
  align-items: center;
  color: rgba(16, 20, 18, 0.62);
  font-size: clamp(14px, 1.1vw, 16px);
  letter-spacing: 0.08em;
}

.route-line__stops li:not(:last-child)::after {
  content: '';
  width: clamp(28px, 4vw, 64px);
  height: 1px;
  margin: 0 14px;
  background: rgba(16, 20, 18, 0.18);
  transform-origin: left center;
  transition:
    background 220ms ease,
    scale 220ms ease;
}

.route-line:hover .route-line__stops li:not(:last-child)::after,
.route-line:focus-visible .route-line__stops li:not(:last-child)::after {
  background: rgba(31, 58, 52, 0.34);
  scale: 1.12 1;
}

.route-preview__more {
  display: inline-flex;
  align-items: center;
  gap: 16px;
  margin-top: clamp(40px, 5vw, 68px);
  font-size: 11px;
  letter-spacing: 0.32em;
  text-transform: uppercase;
  color: rgba(16, 20, 18, 0.5);
  transition: color 220ms ease;
}

.route-preview__more .more-rule {
  display: inline-block;
  width: 36px;
  height: 1px;
  background: rgba(16, 20, 18, 0.2);
  transition: background 220ms ease, width 220ms ease;
}

.route-preview__more .more-arrow {
  font-family: var(--font-serif);
  font-size: 13px;
  letter-spacing: 0;
  transition: transform 220ms ease;
}

.route-preview__more:hover,
.route-preview__more:focus-visible {
  color: var(--deep-green);
  outline: none;
}

.route-preview__more:hover .more-rule,
.route-preview__more:focus-visible .more-rule {
  background: var(--deep-green);
  width: 56px;
}

.route-preview__more:hover .more-arrow,
.route-preview__more:focus-visible .more-arrow {
  transform: translateX(6px);
}

.route-line__media {
  margin: 0;
  aspect-ratio: 4 / 2.6;
  overflow: hidden;
  border: 1px solid rgba(16, 20, 18, 0.08);
  background: rgba(216, 221, 214, 0.42);
}

.route-line__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 50% 50%;
  filter: saturate(0.82) contrast(0.94);
  transition: transform 520ms ease;
}

.route-line:hover .route-line__media img,
.route-line:focus-visible .route-line__media img {
  transform: scale(1.025);
}

.route-line__placeholder {
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

@media (max-width: 900px) {
  .route-line {
    grid-template-columns: 1fr;
    gap: 22px;
  }
}

@media (max-width: 640px) {
  .route-preview__inner {
    padding-inline: 18px;
  }

  .route-preview__heading-meta {
    align-items: flex-start;
    flex-direction: column;
    gap: 8px;
  }

  .route-line__title {
    font-size: clamp(26px, 7vw, 34px);
  }
}
</style>
